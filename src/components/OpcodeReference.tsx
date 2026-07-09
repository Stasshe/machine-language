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
  if (mnemonic === "LOAD") return code === 1 ? SYNTAX.LOAD_MEM! : SYNTAX.LOAD_IMM!;
  return SYNTAX[mnemonic] ?? mnemonic;
}

export default function OpcodeReference() {
  return (
    <details className="bg-panel border border-amber-dim/40 rounded p-4" open>
      <summary className="font-panel uppercase tracking-widest text-xs text-ink/70 cursor-pointer select-none">
        Opcode Table — 4bit + 4bit×3
      </summary>
      <div className="mt-3 flex flex-col gap-1.5 font-mono text-xs">
        {OPCODES.map((op) => (
          <div
            key={`${op.code}-${op.mnemonic}`}
            className="border-t border-amber-dim/15 pt-1.5 first:border-t-0 first:pt-0"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-amber w-4">{op.code.toString(16).toUpperCase()}</span>
              <span className="text-ink/40 w-10">{op.bits}</span>
              <span className="text-ink/40 w-10">{op.format}</span>
              <span className="text-head">{syntaxFor(op.code, op.mnemonic)}</span>
            </div>
            <p className="text-ink/60 pl-6 leading-snug">
              {op.what}
              {op.to}
              {op.action}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
