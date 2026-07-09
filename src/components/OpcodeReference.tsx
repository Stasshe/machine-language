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
    <details
      className="lg:h-full flex flex-col bg-panel border border-amber-dim/40 rounded p-2 sm:p-3 lg:p-4"
      open
    >
      <summary className="shrink-0 font-panel uppercase tracking-widest text-xs text-ink/70 cursor-pointer select-none">
        Opcode Table — 4bit + 4bit×3
      </summary>
      <div className="mt-2 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        <div className="flex flex-col font-mono text-[11px]">
          {OPCODES.map((op) => (
            <div
              key={`${op.code}-${op.mnemonic}`}
              className="border-t border-amber-dim/15 first:border-t-0 py-1"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-amber w-3 shrink-0">{op.code.toString(16).toUpperCase()}</span>
                <span className="text-head">{syntaxFor(op.code, op.mnemonic)}</span>
              </div>
              <p className="text-ink/60 pl-5 leading-snug">
                {op.what}
                {op.to}
                {op.action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
