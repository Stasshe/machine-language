// Instruction set reference data for the virtual machine's opcode table.
// Mirrors the paper spec: 4bit opcode + 4bit*3 operand nibbles = 2 bytes/instruction.

export interface OpcodeSpec {
  code: number; // 0-15
  bits: string; // 4-bit binary string
  format: string; // operand nibble layout, e.g. "R-X-Y"
  mnemonic: string;
  description: string;
}

export const OPCODES: OpcodeSpec[] = [
  {
    code: 1,
    bits: "0001",
    format: "R-X-Y",
    mnemonic: "LOAD",
    description: "Load memory[XY] into register R.",
  },
  {
    code: 2,
    bits: "0010",
    format: "R-X-Y",
    mnemonic: "LOAD",
    description: "Load immediate byte XY into register R.",
  },
  {
    code: 3,
    bits: "0011",
    format: "R-X-Y",
    mnemonic: "STORE",
    description: "Store register R into memory[XY].",
  },
  {
    code: 4,
    bits: "0100",
    format: "0-R-S",
    mnemonic: "MOVE",
    description: "Copy register R into register S.",
  },
  {
    code: 5,
    bits: "0101",
    format: "R-S-T",
    mnemonic: "ADD",
    description: "Add registers S and T into register R.",
  },
  {
    code: 6,
    bits: "0110",
    format: "R-S-T",
    mnemonic: "ADDF",
    description: "Add registers S and T with the floating-add opcode.",
  },
  {
    code: 7,
    bits: "0111",
    format: "R-S-T",
    mnemonic: "OR",
    description: "Bitwise OR registers S and T into register R.",
  },
  {
    code: 8,
    bits: "1000",
    format: "R-S-T",
    mnemonic: "AND",
    description: "Bitwise AND registers S and T into register R.",
  },
  {
    code: 9,
    bits: "1001",
    format: "R-S-T",
    mnemonic: "XOR",
    description: "Bitwise XOR registers S and T into register R.",
  },
  {
    code: 10,
    bits: "1010",
    format: "R-0-X",
    mnemonic: "ROTATE",
    description: "Rotate register R right by X bits.",
  },
  {
    code: 11,
    bits: "1011",
    format: "R-X-Y",
    mnemonic: "JUMP",
    description: "Jump to address XY when register R equals register 0.",
  },
  {
    code: 12,
    bits: "1100",
    format: "0-0-0",
    mnemonic: "HALT",
    description: "Stop execution.",
  },
];

export const MEMORY_SIZE = 256; // 00H - FFH, byte-addressable
export const REGISTER_COUNT = 16; // R0 - R15

export function hexByte(n: number): string {
  return n.toString(16).toUpperCase().padStart(2, "0");
}

export function hexNibble(n: number): string {
  return n.toString(16).toUpperCase();
}
