"use client";

import { hexByte } from "@/lib/isa";
import type { VMState } from "@/lib/vm";
import { describeAt } from "@/lib/vm";

interface Props {
  vm: VMState | null;
}

export default function RegisterBank({ vm }: Props) {
  const registers = vm?.registers ?? new Array(16).fill(0);
  const touchedRegs = new Set(
    (vm?.lastTouched ?? []).filter((t) => t.kind === "reg").map((t) => t.index),
  );

  return (
    <div className="bg-panel border border-amber-dim/40 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-panel uppercase tracking-widest text-xs text-ink/70">Register Bank</h2>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              vm?.halted ? "bg-danger lamp text-danger" : "bg-amber-dim lamp-off"
            }`}
            title="HALT"
          />
          <span className="font-panel text-xs uppercase tracking-widest text-ink/70">Halt</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {registers.map((val, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: register number i is a fixed, stable identity
            key={i}
            className={`rounded border px-2 py-1.5 transition-colors ${
              touchedRegs.has(i) ? "border-amber bg-amber/10" : "border-amber-dim/40 bg-chassis/60"
            }`}
          >
            <div className="font-panel text-[10px] uppercase tracking-wider text-ink/50">R{i}</div>
            <div
              className={`font-readout text-2xl leading-none ${
                touchedRegs.has(i) ? "text-amber glow-amber" : "text-amber/70"
              }`}
            >
              {hexByte(val)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-amber-dim/30 pt-3 flex items-center justify-between">
        <div>
          <div className="font-panel text-[10px] uppercase tracking-wider text-ink/50">
            Program Counter
          </div>
          <div className="font-readout text-3xl text-head glow-amber leading-none">
            {vm ? `${hexByte(vm.pc)}H` : "--H"}
          </div>
        </div>
        <div className="text-right">
          <div className="font-panel text-[10px] uppercase tracking-wider text-ink/50">
            Next Instruction
          </div>
          <div className="font-panel text-sm text-ink/80">
            {vm ? describeAt(vm.memory, vm.pc) : "-"}
          </div>
        </div>
        <div className="text-right">
          <div className="font-panel text-[10px] uppercase tracking-wider text-ink/50">Cycles</div>
          <div className="font-readout text-2xl text-ink/70 leading-none">{vm?.cycles ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
