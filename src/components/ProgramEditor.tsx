"use client";

import type { AssembleResult } from "@/lib/assembler";
import { hexByte } from "@/lib/isa";

interface Props {
  value: string;
  onChange: (value: string) => void;
  assembleResult: AssembleResult | null;
  currentPc: number | null;
}

export default function ProgramEditor({ value, onChange, assembleResult, currentPc }: Props) {
  const codeLines = assembleResult?.lines.filter((l) => l.address !== null) ?? [];

  return (
    <div className="lg:h-full flex flex-col bg-panel border-2 border-amber-dim rounded p-2 sm:p-3 lg:p-4 gap-2">
      <div className="shrink-0 flex items-center justify-between gap-2">
        <h2 className="font-panel uppercase tracking-widest text-xs text-ink font-semibold whitespace-nowrap">
          Assembly Program
        </h2>
        <span className="hidden md:block font-panel text-[10px] uppercase tracking-wider text-ink/70 truncate">
          LOAD / STORE / MOVE / ADD / ADDF / OR / AND / XOR / ROTATE / JUMP / HALT
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        rows={4}
        placeholder={"LOAD R0, 00H\nLOAD R1, [FFH]\nAND R3, R1, R2\nJUMP R3, [0CH]\nHALT"}
        className="shrink-0 w-full resize-none rounded bg-chassis border-2 border-amber-dim text-ink font-mono text-sm p-2 sm:p-3 leading-relaxed outline-none focus:border-amber"
      />

      <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto rounded border-2 border-amber-dim">
        <table className="w-full text-left font-mono text-xs">
          <thead className="sticky top-0">
            <tr className="bg-chassis text-ink font-panel uppercase tracking-wider text-[10px] font-semibold">
              <th className="px-2 py-1 w-14">Addr</th>
              <th className="px-2 py-1">Source</th>
              <th className="px-2 py-1 w-20">Machine</th>
            </tr>
          </thead>
          <tbody>
            {codeLines.length === 0 && (
              <tr>
                <td colSpan={3} className="px-2 py-2 text-ink/60">
                  Assemble して命令を確定してください
                </td>
              </tr>
            )}
            {codeLines.map((l) => {
              const isPc = l.address === currentPc;
              return (
                <tr
                  key={l.line}
                  className={`border-t border-amber-dim ${isPc ? "bg-amber/20" : ""}`}
                >
                  <td className={`px-2 py-1 font-semibold ${isPc ? "text-head" : "text-ink/70"}`}>
                    {hexByte(l.address!)}H
                  </td>
                  <td className={`px-2 py-1 ${l.error ? "text-danger font-semibold" : "text-ink"}`}>
                    {l.text.trim() || l.error}
                  </td>
                  <td className="px-2 py-1 text-amber font-semibold">
                    {l.bytes ? `${hexByte(l.bytes[0])} ${hexByte(l.bytes[1])}` : "--"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
