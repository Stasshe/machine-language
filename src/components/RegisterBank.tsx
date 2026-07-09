"use client";

import { hexByte } from "@/lib/isa";
import type { VMState } from "@/lib/vm";
import { describeAt } from "@/lib/vm";

interface Props {
  vm: VMState | null;
}

function haltedLabel(vm: VMState | null): string {
  if (vm?.halted) return "HALT";
  return "READY";
}

function cellClassName(isTouched: boolean): string {
  let className = "border-r border-amber-dim px-2 py-1 last:border-r-0";
  if (isTouched) className += " bg-head/10";
  return className;
}

function valueClassName(isTouched: boolean): string {
  let className = "text-sm font-semibold";
  if (isTouched) {
    className += " text-head";
  } else {
    className += " text-ink";
  }
  return className;
}

function pcLabel(vm: VMState | null): string {
  if (!vm) return "--H";
  return `${hexByte(vm.pc)}H`;
}

function nextInstructionLabel(vm: VMState | null): string {
  if (!vm) return "-";
  return describeAt(vm.memory, vm.pc);
}

export default function RegisterBank({ vm }: Props) {
  const registers = vm?.registers ?? new Array(16).fill(0);
  const touchedRegs = new Set(
    (vm?.lastTouched ?? []).filter((t) => t.kind === "reg").map((t) => t.index),
  );
  const rows = Array.from({ length: 4 }, (_, rowIndex) =>
    registers.slice(rowIndex * 4, rowIndex * 4 + 4),
  );

  return (
    <div className="h-full flex flex-col bg-panel border border-amber-dim">
      <div className="shrink-0 flex items-center justify-between border-b border-amber-dim px-2 py-1.5">
        <h2 className="font-panel text-xs text-ink font-semibold">Registers</h2>
        <span className="font-panel text-xs text-ink/70">{haltedLabel(vm)}</span>
      </div>

      <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        <table className="w-full border-collapse text-left font-mono text-xs">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                // biome-ignore lint/suspicious/noArrayIndexKey: register rows are fixed by CPU layout
                key={rowIndex}
                className="border-b border-amber-dim last:border-b-0"
              >
                {row.map((val, columnIndex) => {
                  const registerIndex = rowIndex * 4 + columnIndex;
                  const isTouched = touchedRegs.has(registerIndex);
                  return (
                    <td
                      key={registerIndex}
                      className={cellClassName(isTouched)}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-panel text-[10px] text-ink/60">R{registerIndex}</span>
                        <span className={valueClassName(isTouched)}>{hexByte(val)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <table className="shrink-0 w-full border-t border-amber-dim text-left font-mono text-xs">
        <tbody>
          <tr className="border-b border-amber-dim">
            <th className="w-24 bg-chassis px-2 py-1 font-panel text-[10px] text-ink/60">PC</th>
            <td className="px-2 py-1 font-semibold text-head">{pcLabel(vm)}</td>
          </tr>
          <tr className="border-b border-amber-dim">
            <th className="w-24 bg-chassis px-2 py-1 font-panel text-[10px] text-ink/60">Next</th>
            <td className="px-2 py-1">{nextInstructionLabel(vm)}</td>
          </tr>
          <tr>
            <th className="w-24 bg-chassis px-2 py-1 font-panel text-[10px] text-ink/60">Cycles</th>
            <td className="px-2 py-1">{vm?.cycles ?? 0}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
