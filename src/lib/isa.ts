// Instruction set reference data for the virtual machine's opcode table.
// Mirrors the paper spec: 4bit opcode + 4bit*3 operand nibbles = 2 bytes/instruction.

export interface OpcodeSpec {
  code: number; // 0-15
  bits: string; // 4-bit binary string
  format: string; // operand nibble layout, e.g. "R-X-Y"
  mnemonic: string;
  what: string; // 何を
  to: string; // 何に
  action: string; // どうする
}

export const OPCODES: OpcodeSpec[] = [
  {
    code: 1,
    bits: "0001",
    format: "R-X-Y",
    mnemonic: "LOAD",
    what: "アドレスXYのデータを",
    to: "レジスタRに",
    action: "転送する",
  },
  {
    code: 2,
    bits: "0010",
    format: "R-X-Y",
    mnemonic: "LOAD",
    what: "データXYを",
    to: "レジスタRに",
    action: "転送する",
  },
  {
    code: 3,
    bits: "0011",
    format: "R-X-Y",
    mnemonic: "STORE",
    what: "レジスタRのデータを",
    to: "アドレスXYに",
    action: "転送する",
  },
  {
    code: 4,
    bits: "0100",
    format: "0-R-S",
    mnemonic: "MOVE",
    what: "レジスタRのデータを",
    to: "レジスタSに",
    action: "転送する",
  },
  {
    code: 5,
    bits: "0101",
    format: "R-S-T",
    mnemonic: "ADD",
    what: "レジスタS,Tのデータを",
    to: "レジスタRに",
    action: "整数加算する",
  },
  {
    code: 6,
    bits: "0110",
    format: "R-S-T",
    mnemonic: "ADDF",
    what: "レジスタS,Tのデータを",
    to: "レジスタRに",
    action: "小数加算する",
  },
  {
    code: 7,
    bits: "0111",
    format: "R-S-T",
    mnemonic: "OR",
    what: "レジスタS,Tのデータを",
    to: "レジスタRに",
    action: "論理和",
  },
  {
    code: 8,
    bits: "1000",
    format: "R-S-T",
    mnemonic: "AND",
    what: "レジスタS,Tのデータを",
    to: "レジスタRに",
    action: "論理積",
  },
  {
    code: 9,
    bits: "1001",
    format: "R-S-T",
    mnemonic: "XOR",
    what: "レジスタS,Tのデータを",
    to: "レジスタRに",
    action: "排他的論理和",
  },
  {
    code: 10,
    bits: "1010",
    format: "R-0-X",
    mnemonic: "ROTATE",
    what: "レジスタRのデータを",
    to: "右にXbitだけ",
    action: "bit巡回(シフト)",
  },
  {
    code: 11,
    bits: "1011",
    format: "R-X-Y",
    mnemonic: "JUMP",
    what: "レジスタRのデータが",
    to: "レジスタ0のデータと等しければ",
    action: "アドレスXYの命令に分岐する",
  },
  {
    code: 12,
    bits: "1100",
    format: "0-0-0",
    mnemonic: "HALT",
    what: "",
    to: "",
    action: "終了する",
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
