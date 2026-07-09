// Parses the assembly text (one instruction per line) into machine words.
// Each instruction is 2 bytes: [opcode<<4 | n1, n2<<4 | n3], stored at a
// sequential even address starting at 00H (matching the paper spec's layout).

export interface AssembledLine {
  line: number; // source line index (0-based)
  text: string;
  address: number | null; // null for blank/comment lines
  bytes: [number, number] | null;
  error: string | null;
}

export interface AssembleResult {
  lines: AssembledLine[];
  memoryPatch: Map<number, number>; // address -> byte value
  ok: boolean;
}

const REG = "R(\\d{1,2})";
const ADDR = "\\[([0-9A-Fa-f]{1,2})H\\]";
const IMM = "([0-9A-Fa-f]{1,2})H";
const NUM = "(\\d{1,2})";

function matchAll(pattern: string, input: string): RegExpMatchArray | null {
  return input.match(new RegExp(`^${pattern}$`, "i"));
}

function requireReg(n: string | undefined): number {
  const v = Number.parseInt(n ?? "", 10);
  if (Number.isNaN(v) || v < 0 || v > 15) throw new Error(`レジスタ番号 R${n} は0-15の範囲外`);
  return v;
}

function requireByte(n: string | undefined): number {
  const v = Number.parseInt(n ?? "", 16);
  if (Number.isNaN(v) || v < 0 || v > 255) throw new Error(`アドレス/値 ${n}H は00-FFの範囲外`);
  return v;
}

function requireNibble(n: string | undefined): number {
  const v = Number.parseInt(n ?? "", 10);
  if (Number.isNaN(v) || v < 0 || v > 15) throw new Error(`シフト量 ${n} は0-15の範囲外`);
  return v;
}

function encode(opcode: number, n1: number, n2: number, n3: number): [number, number] {
  return [(opcode << 4) | n1, (n2 << 4) | n3];
}

function assembleOperands(mnemonic: string, operands: string): [number, number] {
  const ops = operands.trim();
  switch (mnemonic) {
    case "LOAD": {
      let m = matchAll(`${REG}\\s*,\\s*${ADDR}`, ops);
      if (m) {
        const r = requireReg(m[1]);
        const addr = requireByte(m[2]);
        return encode(1, r, addr >> 4, addr & 0xf);
      }
      m = matchAll(`${REG}\\s*,\\s*${IMM}`, ops);
      if (m) {
        const r = requireReg(m[1]);
        const val = requireByte(m[2]);
        return encode(2, r, val >> 4, val & 0xf);
      }
      throw new Error("書式: LOAD Rn, [XXH]  または  LOAD Rn, XXH");
    }
    case "STORE": {
      const m = matchAll(`${REG}\\s*,\\s*${ADDR}`, ops);
      if (!m) throw new Error("書式: STORE Rn, [XXH]");
      const r = requireReg(m[1]);
      const addr = requireByte(m[2]);
      return encode(3, r, addr >> 4, addr & 0xf);
    }
    case "MOVE": {
      const m = matchAll(`${REG}\\s*,\\s*${REG}`, ops);
      if (!m) throw new Error("書式: MOVE Rn, Rm");
      return encode(4, 0, requireReg(m[1]), requireReg(m[2]));
    }
    case "ADD":
    case "ADDF":
    case "OR":
    case "AND":
    case "XOR": {
      const m = matchAll(`${REG}\\s*,\\s*${REG}\\s*,\\s*${REG}`, ops);
      if (!m) throw new Error(`書式: ${mnemonic} Rn, Rs, Rt`);
      const opcode = { ADD: 5, ADDF: 6, OR: 7, AND: 8, XOR: 9 }[mnemonic] as number;
      return encode(opcode, requireReg(m[1]), requireReg(m[2]), requireReg(m[3]));
    }
    case "ROTATE": {
      const m = matchAll(`${REG}\\s*,\\s*${NUM}`, ops);
      if (!m) throw new Error("書式: ROTATE Rn, X  (Xは0-15のシフト量)");
      return encode(10, requireReg(m[1]), 0, requireNibble(m[2]));
    }
    case "JUMP": {
      const m = matchAll(`${REG}\\s*,\\s*${ADDR}`, ops);
      if (!m) throw new Error("書式: JUMP Rn, [XXH]");
      const r = requireReg(m[1]);
      const addr = requireByte(m[2]);
      return encode(11, r, addr >> 4, addr & 0xf);
    }
    case "HALT": {
      if (ops.length > 0) throw new Error("HALTにオペランドは不要");
      return encode(12, 0, 0, 0);
    }
    default:
      throw new Error(`未知の命令: ${mnemonic}`);
  }
}

function stripComment(raw: string): string {
  const idx = raw.search(/(\/\/|#|；|;)/);
  return idx === -1 ? raw : raw.slice(0, idx);
}

export function assemble(source: string): AssembleResult {
  const lines: AssembledLine[] = [];
  const memoryPatch = new Map<number, number>();
  let address = 0;
  let ok = true;

  source.split("\n").forEach((raw, idx) => {
    const code = stripComment(raw).trim();
    if (code.length === 0) {
      lines.push({ line: idx, text: raw, address: null, bytes: null, error: null });
      return;
    }
    const spaceIdx = code.search(/\s/);
    const mnemonic = (spaceIdx === -1 ? code : code.slice(0, spaceIdx)).toUpperCase();
    const operands = spaceIdx === -1 ? "" : code.slice(spaceIdx + 1);

    try {
      const bytes = assembleOperands(mnemonic, operands);
      if (address > 0xfe) throw new Error("プログラムが256バイトのメモリに収まらない");
      memoryPatch.set(address, bytes[0]);
      memoryPatch.set(address + 1, bytes[1]);
      lines.push({ line: idx, text: raw, address, bytes, error: null });
      address += 2;
    } catch (e) {
      ok = false;
      lines.push({ line: idx, text: raw, address, bytes: null, error: (e as Error).message });
      address += 2;
    }
  });

  return { lines, memoryPatch, ok };
}
