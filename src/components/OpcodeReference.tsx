"use client";

import { OPCODES } from "@/lib/isa";

const SYNTAX: Record<string, string> = {
  LOAD_MEM: "LOAD Rn, [XXH]",
  LOAD_IMM: "LOAD Rn, XXH",
  STORE: "STORE Rn, [XXH]",
  MOVE: "MOVE Rn, Rm",
  ADD: "ADD Rn, Rs, Rt",
  ADDF: "ADDF Rn, Rs, Rt",
  OR: "OR Rn, Rs, Rt",
  AND: "AND Rn, Rs, Rt",
  XOR: "XOR Rn, Rs, Rt",
  ROTATE: "ROTATE Rn, X",
  JUMP: "JUMP Rn, [XXH]",
  HALT: "HALT",
};

function syntaxFor(code: number, mnemonic: string): string {
  if (mnemonic === "LOAD") {
    if (code === 1) return SYNTAX.LOAD_MEM;
    return SYNTAX.LOAD_IMM;
  }
  return SYNTAX[mnemonic] ?? mnemonic;
}

export default function OpcodeReference() {
  return (
    <details
      className="flex flex-col bg-panel border border-amber-dim"
      open
    >
      <summary className="shrink-0 border-b border-amber-dim px-2 py-1.5 font-panel text-xs font-semibold cursor-pointer select-none">
        Opcode Table
      </summary>
      <div>
        <table className="w-full border-collapse text-left text-[11px]">
          <thead className="bg-chassis font-panel text-[10px] text-ink/70">
            <tr>
              <th className="border-b border-amber-dim px-2 py-1">Hex</th>
              <th className="border-b border-amber-dim px-2 py-1">Bits</th>
              <th className="border-b border-amber-dim px-2 py-1">Format</th>
              <th className="border-b border-amber-dim px-2 py-1">Syntax</th>
              <th className="border-b border-amber-dim px-2 py-1">Effect</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {OPCODES.map((op) => (
              <tr key={`${op.code}-${op.mnemonic}`} className="border-b border-amber-dim last:border-b-0">
                <td className="px-2 py-1 font-semibold text-amber">
                  {op.code.toString(16).toUpperCase()}
                </td>
                <td className="px-2 py-1 text-ink/75">{op.bits}</td>
                <td className="px-2 py-1 text-ink/75">{op.format}</td>
                <td className="px-2 py-1 font-semibold text-ink">{syntaxFor(op.code, op.mnemonic)}</td>
                <td className="px-2 py-1 text-ink/75">{op.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
