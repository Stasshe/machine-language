"use client";

import type { AssembledLine, AssembleResult } from "@/lib/assembler";
import { hexByte } from "@/lib/isa";

interface Props {
  value: string;
  onChange: (value: string) => void;
  assembleResult: AssembleResult | null;
  currentPc: number | null;
}

type InstructionLine = AssembledLine & { address: number };

function hasAddress(line: AssembledLine): line is InstructionLine {
  return line.address !== null;
}

function rowClassName(isPc: boolean): string {
  let className = "border-t border-amber-dim";
  if (isPc) className += " bg-head/10";
  return className;
}

function addressClassName(isPc: boolean): string {
  let className = "px-2 py-1 font-semibold";
  if (isPc) {
    className += " text-head";
  } else {
    className += " text-ink/70";
  }
  return className;
}

function sourceClassName(hasError: boolean): string {
  let className = "px-2 py-1";
  if (hasError) {
    className += " text-danger font-semibold";
  } else {
    className += " text-ink";
  }
  return className;
}

function bytesText(bytes: [number, number] | null): string {
  if (!bytes) return "--";
  return `${hexByte(bytes[0])} ${hexByte(bytes[1])}`;
}

export default function ProgramEditor({ value, onChange, assembleResult, currentPc }: Props) {
  const codeLines = assembleResult?.lines.filter(hasAddress) ?? [];

  return (
    <div className="lg:h-full flex flex-col bg-panel border border-amber-dim">
      <div className="shrink-0 flex items-center justify-between gap-2 border-b border-amber-dim px-2 py-1.5">
        <h2 className="font-panel text-xs text-ink font-semibold whitespace-nowrap">Program</h2>
        <span className="hidden md:block font-panel text-[10px] text-ink/60 truncate">
          LOAD / STORE / MOVE / ADD / ADDF / OR / AND / XOR / ROTATE / JUMP / HALT
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        rows={7}
        placeholder={"LOAD R0, 00H\nLOAD R1, [FFH]\nAND R3, R1, R2\nJUMP R3, [0CH]\nHALT"}
        className="shrink-0 w-full resize-none border-b border-amber-dim bg-white text-ink font-mono text-sm p-2 leading-relaxed outline-none focus:bg-chassis"
      />

      <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="sticky top-0">
            <tr className="bg-chassis text-ink/70 font-panel text-[10px] font-semibold">
              <th className="border-b border-amber-dim px-2 py-1 w-10">Line</th>
              <th className="px-2 py-1 w-14">Addr</th>
              <th className="px-2 py-1">Source</th>
              <th className="px-2 py-1 w-20">Machine</th>
            </tr>
          </thead>
          <tbody>
            {codeLines.length === 0 && (
              <tr>
                <td colSpan={4} className="px-2 py-2 text-ink/60">
                  Assemble the program to populate this table.
                </td>
              </tr>
            )}
            {codeLines.map((l) => {
              const isPc = l.address === currentPc;
              const hasError = Boolean(l.error);
              return (
                <tr key={l.line} className={rowClassName(isPc)}>
                  <td className="px-2 py-1 text-ink/55">{l.line + 1}</td>
                  <td className={addressClassName(isPc)}>{hexByte(l.address)}H</td>
                  <td className={sourceClassName(hasError)}>
                    {l.text.trim() || l.error}
                  </td>
                  <td className="px-2 py-1 text-amber font-semibold">
                    {bytesText(l.bytes)}
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
