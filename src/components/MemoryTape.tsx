"use client";

import { useEffect, useRef, type Ref } from "react";
import { hexByte } from "@/lib/isa";
import type { VMState } from "@/lib/vm";

interface Props {
  vm: VMState | null;
}

const FF = 0xff;

function cellClassName({
  isPc,
  isTouched,
  isFF,
  val,
}: {
  isPc: boolean;
  isTouched: boolean;
  isFF: boolean;
  val: number;
}): string {
  let className = "border-r border-amber-dim px-2 py-1 last:border-r-0";
  if (isPc) className += " bg-head/15 text-head font-semibold";
  if (isTouched) className += " bg-amber/10 text-amber font-semibold";
  if (isFF) className += " outline outline-1 outline-danger";
  if (val === 0 && !isPc && !isTouched) className += " text-ink/35";
  return className;
}

export default function MemoryTape({ vm }: Props) {
  const cells = vm?.memory ?? new Array(256).fill(0);
  const pc = vm?.pc ?? -1;
  const touchedMem = new Set(
    (vm?.lastTouched ?? []).filter((t) => t.kind === "mem").map((t) => t.index),
  );
  const headRef = useRef<HTMLTableCellElement>(null);
  const rows = Array.from({ length: 16 }, (_, rowIndex) =>
    cells.slice(rowIndex * 16, rowIndex * 16 + 16),
  );

  // headRef is (re)attached to the cell at `pc` on every render, so the
  // scroll must re-run whenever pc changes even though the callback body
  // only reads the ref.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pc drives which element headRef points to
  useEffect(() => {
    headRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [pc]);

  return (
    <div className="bg-panel border border-amber-dim">
      <div className="flex items-center justify-between border-b border-amber-dim px-2 py-1.5">
        <h2 className="font-panel text-xs text-ink font-semibold">Memory</h2>
        <span className="hidden sm:block font-panel text-[10px] text-ink/60">00H-FFH</span>
      </div>
      <div className="overflow-auto">
        <table className="min-w-[760px] w-full border-collapse text-center font-mono text-[11px]">
          <thead className="bg-chassis font-panel text-[10px] text-ink/60">
            <tr>
              <th className="sticky left-0 z-10 w-12 border-r border-amber-dim bg-chassis px-2 py-1 text-left">
                Addr
              </th>
              {Array.from({ length: 16 }, (_, index) => (
                <th
                  // biome-ignore lint/suspicious/noArrayIndexKey: memory columns are fixed hexadecimal offsets
                  key={index}
                  className="border-b border-amber-dim px-2 py-1"
                >
                  +{index.toString(16).toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                // biome-ignore lint/suspicious/noArrayIndexKey: memory rows are fixed hexadecimal ranges
                key={rowIndex}
                className="border-t border-amber-dim"
              >
                <th className="sticky left-0 z-10 border-r border-amber-dim bg-chassis px-2 py-1 text-left font-panel text-[10px] text-ink/60">
                  {hexByte(rowIndex * 16)}H
                </th>
                {row.map((val, columnIndex) => {
                  const addr = rowIndex * 16 + columnIndex;
                  const isPc = addr === pc || addr === pc + 1;
                  const isFF = addr === FF;
                  const isTouched = touchedMem.has(addr);
                  let cellRef: Ref<HTMLTableCellElement> | undefined;
                  if (addr === pc) cellRef = headRef;
                  return (
                    <td
                      key={addr}
                      ref={cellRef}
                      title={`${hexByte(addr)}H`}
                      className={cellClassName({ isPc, isTouched, isFF, val })}
                    >
                      {hexByte(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
