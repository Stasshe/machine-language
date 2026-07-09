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
  if (Number.isNaN(v) || v < 0 || v > 15) throw new Error(`Register R${n} is outside 0-15.`);
  return v;
}

function requireByte(n: string | undefined): number {
  const v = Number.parseInt(n ?? "", 16);
  if (Number.isNaN(v) || v < 0 || v > 255) throw new Error(`Address/value ${n}H is outside 00-FF.`);
  return v;
}

function requireNibble(n: string | undefined): number {
  const v = Number.parseInt(n ?? "", 10);
  if (Number.isNaN(v) || v < 0 || v > 15) throw new Error(`Shift amount ${n} is outside 0-15.`);
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
      throw new Error("Syntax: LOAD Rn, [XXH] or LOAD Rn, XXH");
    }
    case "STORE": {
      const m = matchAll(`${REG}\\s*,\\s*${ADDR}`, ops);
      if (!m) throw new Error("Syntax: STORE Rn, [XXH]");
      const r = requireReg(m[1]);
      const addr = requireByte(m[2]);
      return encode(3, r, addr >> 4, addr & 0xf);
    }
    case "MOVE": {
      const m = matchAll(`${REG}\\s*,\\s*${REG}`, ops);
      if (!m) throw new Error("Syntax: MOVE Rn, Rm");
      return encode(4, 0, requireReg(m[1]), requireReg(m[2]));
    }
    case "ADD":
    case "ADDF":
    case "OR":
    case "AND":
    case "XOR": {
      const m = matchAll(`${REG}\\s*,\\s*${REG}\\s*,\\s*${REG}`, ops);
      if (!m) throw new Error(`Syntax: ${mnemonic} Rn, Rs, Rt`);
      const opcode = { ADD: 5, ADDF: 6, OR: 7, AND: 8, XOR: 9 }[mnemonic] as number;
      return encode(opcode, requireReg(m[1]), requireReg(m[2]), requireReg(m[3]));
    }
    case "ROTATE": {
      const m = matchAll(`${REG}\\s*,\\s*${NUM}`, ops);
      if (!m) throw new Error("Syntax: ROTATE Rn, X (X is a 0-15 shift amount)");
      return encode(10, requireReg(m[1]), 0, requireNibble(m[2]));
    }
    case "JUMP": {
      const m = matchAll(`${REG}\\s*,\\s*${ADDR}`, ops);
      if (!m) throw new Error("Syntax: JUMP Rn, [XXH]");
      const r = requireReg(m[1]);
      const addr = requireByte(m[2]);
      return encode(11, r, addr >> 4, addr & 0xf);
    }
    case "HALT": {
      if (ops.length > 0) throw new Error("HALT does not take operands.");
      return encode(12, 0, 0, 0);
    }
    default:
      throw new Error(`Unknown instruction: ${mnemonic}`);
  }
}

function stripComment(raw: string): string {
  const idx = raw.search(/(\/\/|#|；|;)/);
  if (idx === -1) return raw;
  return raw.slice(0, idx);
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
    let mnemonicSource = code;
    let operands = "";
    if (spaceIdx !== -1) {
      mnemonicSource = code.slice(0, spaceIdx);
      operands = code.slice(spaceIdx + 1);
    }
    const mnemonic = mnemonicSource.toUpperCase();

    try {
      const bytes = assembleOperands(mnemonic, operands);
      if (address > 0xfe) throw new Error("Program does not fit in 256 bytes of memory.");
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
