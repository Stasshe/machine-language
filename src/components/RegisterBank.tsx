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
    <div className="h-full flex flex-col bg-panel border-2 border-amber-dim rounded p-2 sm:p-3 lg:p-4">
      <div className="shrink-0 flex items-center justify-between mb-1 sm:mb-1.5">
        <h2 className="font-panel uppercase tracking-widest text-xs text-ink font-semibold">
          Register Bank
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              vm?.halted ? "bg-danger lamp text-danger" : "bg-amber-dim lamp-off"
            }`}
            title="HALT"
          />
          <span className="font-panel text-xs uppercase tracking-widest text-ink/80">Halt</span>
        </div>
      </div>

      <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
          {registers.map((val, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: register number i is a fixed, stable identity
              key={i}
              className={`rounded border-2 px-1 py-0.5 sm:px-1.5 sm:py-1 transition-colors ${
                touchedRegs.has(i) ? "border-amber bg-amber/15" : "border-amber-dim bg-chassis"
              }`}
            >
              <div className="font-panel text-[9px] uppercase tracking-wider text-ink/70 font-semibold">
                R{i}
              </div>
              <div
                className={`font-readout text-base sm:text-lg lg:text-xl leading-none ${
                  touchedRegs.has(i) ? "text-amber glow-amber" : "text-amber/90"
                }`}
              >
                {hexByte(val)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t-2 border-amber-dim pt-1 sm:pt-1.5 flex items-center justify-between">
        <div>
          <div className="font-panel text-[9px] uppercase tracking-wider text-ink/70 font-semibold">
            Program Counter
          </div>
          <div className="font-readout text-xl sm:text-2xl text-head glow-amber leading-none">
            {vm ? `${hexByte(vm.pc)}H` : "--H"}
          </div>
        </div>
        <div className="text-right">
          <div className="font-panel text-[9px] uppercase tracking-wider text-ink/70 font-semibold">
            Next Instruction
          </div>
          <div className="font-panel text-xs text-ink font-medium">
            {vm ? describeAt(vm.memory, vm.pc) : "-"}
          </div>
        </div>
        <div className="text-right">
          <div className="font-panel text-[9px] uppercase tracking-wider text-ink/70 font-semibold">
            Cycles
          </div>
          <div className="font-readout text-lg sm:text-xl text-ink leading-none">
            {vm?.cycles ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}
