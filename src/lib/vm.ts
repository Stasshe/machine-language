import { MEMORY_SIZE, REGISTER_COUNT } from "./isa";

export interface VMState {
  memory: number[];
  registers: number[];
  pc: number;
  halted: boolean;
  error: string | null;
  lastTouched: { kind: "reg" | "mem"; index: number }[];
  cycles: number;
}

export function createVM(memoryPatch: Map<number, number>, ffValue: number): VMState {
  const memory = new Array(MEMORY_SIZE).fill(0);
  for (const [addr, val] of memoryPatch) memory[addr] = val;
  memory[0xff] = ffValue & 0xff;
  return {
    memory,
    registers: new Array(REGISTER_COUNT).fill(0),
    pc: 0,
    halted: false,
    error: null,
    lastTouched: [],
    cycles: 0,
  };
}

function rotateRight8(value: number, bits: number): number {
  const n = bits % 8;
  if (n === 0) return value & 0xff;
  return ((value >>> n) | (value << (8 - n))) & 0xff;
}

const OPCODE_NAMES: Record<number, string> = {
  1: "LOAD (mem)",
  2: "LOAD (imm)",
  3: "STORE",
  4: "MOVE",
  5: "ADD",
  6: "ADDF",
  7: "OR",
  8: "AND",
  9: "XOR",
  10: "ROTATE",
  11: "JUMP",
  12: "HALT",
};

export function describeAt(memory: number[], pc: number): string {
  if (pc > 0xfe) return "(範囲外)";
  const b0 = memory[pc]!;
  const opcode = b0 >> 4;
  return OPCODE_NAMES[opcode] ?? `不明(${opcode.toString(16)})`;
}

// ADDF is kept bit-identical to ADD: the paper spec names a distinct opcode
// for decimal addition but never defines a concrete floating-point encoding
// for an 8-bit cell, so both wrap as unsigned mod-256 integers here.
export function step(state: VMState): VMState {
  if (state.halted) return state;

  const memory = state.memory.slice();
  const registers = state.registers.slice();
  const pc = state.pc;
  const b0 = memory[pc]!;
  const b1 = memory[pc + 1]!;
  const opcode = b0 >> 4;
  const n1 = b0 & 0xf;
  const n2 = b1 >> 4;
  const n3 = b1 & 0xf;
  const touched: VMState["lastTouched"] = [];
  let nextPc = pc + 2;
  let halted = false;
  let error: string | null = null;

  switch (opcode) {
    case 1: {
      const addr = (n2 << 4) | n3;
      registers[n1] = memory[addr]!;
      touched.push({ kind: "reg", index: n1 }, { kind: "mem", index: addr });
      break;
    }
    case 2: {
      registers[n1] = (n2 << 4) | n3;
      touched.push({ kind: "reg", index: n1 });
      break;
    }
    case 3: {
      const addr = (n2 << 4) | n3;
      memory[addr] = registers[n1]!;
      touched.push({ kind: "mem", index: addr });
      break;
    }
    case 4: {
      registers[n3] = registers[n2]!;
      touched.push({ kind: "reg", index: n3 });
      break;
    }
    case 5:
    case 6: {
      registers[n1] = (registers[n2]! + registers[n3]!) & 0xff;
      touched.push({ kind: "reg", index: n1 });
      break;
    }
    case 7: {
      registers[n1] = registers[n2]! | registers[n3]!;
      touched.push({ kind: "reg", index: n1 });
      break;
    }
    case 8: {
      registers[n1] = registers[n2]! & registers[n3]!;
      touched.push({ kind: "reg", index: n1 });
      break;
    }
    case 9: {
      registers[n1] = registers[n2]! ^ registers[n3]!;
      touched.push({ kind: "reg", index: n1 });
      break;
    }
    case 10: {
      registers[n1] = rotateRight8(registers[n1]!, n3);
      touched.push({ kind: "reg", index: n1 });
      break;
    }
    case 11: {
      const addr = (n2 << 4) | n3;
      if (registers[n1] === registers[0]) nextPc = addr;
      break;
    }
    case 12: {
      halted = true;
      nextPc = pc;
      break;
    }
    default: {
      error = `PC=${pc.toString(16).toUpperCase()}H の不明なオペコード ${opcode.toString(16)}`;
      halted = true;
    }
  }

  return {
    memory,
    registers,
    pc: nextPc,
    halted,
    error,
    lastTouched: touched,
    cycles: state.cycles + 1,
  };
}
