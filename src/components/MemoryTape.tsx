"use client";

import { useEffect, useRef } from "react";
import { hexByte } from "@/lib/isa";
import type { VMState } from "@/lib/vm";

interface Props {
  vm: VMState | null;
}

const FF = 0xff;

export default function MemoryTape({ vm }: Props) {
  const cells = vm?.memory ?? new Array(256).fill(0);
  const pc = vm?.pc ?? -1;
  const touchedMem = new Set(
    (vm?.lastTouched ?? []).filter((t) => t.kind === "mem").map((t) => t.index),
  );
  const headRef = useRef<HTMLDivElement>(null);

  // headRef is (re)attached to the cell at `pc` on every render, so the
  // scroll must re-run whenever pc changes even though the callback body
  // only reads the ref.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pc drives which element headRef points to
  useEffect(() => {
    headRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [pc]);

  return (
    <div className="bg-panel border border-amber-dim/40 rounded p-2 sm:p-3 lg:p-4">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <h2 className="font-panel uppercase tracking-widest text-xs text-ink/70">
          Memory Tape — 00H – FFH
        </h2>
        <span className="hidden sm:block font-panel text-[10px] uppercase tracking-wider text-ink/50">
          scroll to inspect
        </span>
      </div>
      <div className="relative overflow-x-auto rounded bg-chassis/70 py-1">
        <div className="sprocket-row h-2" />
        <div className="flex">
          {cells.map((val, addr) => {
            const isPc = addr === pc || addr === pc + 1;
            const isFF = addr === FF;
            const isTouched = touchedMem.has(addr);
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: addr is a fixed memory address, not a reorderable index
                key={addr}
                ref={addr === pc ? headRef : undefined}
                className="relative flex-none w-7 sm:w-9 flex flex-col items-center justify-center border-r border-amber-dim/20 py-1 sm:py-1.5"
              >
                {isPc && (
                  <div className="absolute -top-1.5 left-0 right-0 h-0.5 bg-head glow-amber" />
                )}
                <span
                  className={`font-readout text-sm sm:text-base leading-none ${
                    isPc
                      ? "text-head glow-amber"
                      : isTouched
                        ? "text-amber glow-amber"
                        : val
                          ? "text-ink/70"
                          : "text-ink/25"
                  }`}
                >
                  {hexByte(val)}
                </span>
                <span className="font-panel text-[9px] text-ink/35 leading-none mt-0.5">
                  {hexByte(addr)}
                </span>
                {isFF && (
                  <span className="absolute -bottom-4 font-panel text-[9px] uppercase tracking-wider text-danger">
                    in
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="sprocket-row h-2" />
      </div>
    </div>
  );
}
