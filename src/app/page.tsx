"use client";

import { useEffect, useMemo, useState } from "react";
import ControlPanel from "@/components/ControlPanel";
import MemoryTape from "@/components/MemoryTape";
import OpcodeReference from "@/components/OpcodeReference";
import ProgramEditor from "@/components/ProgramEditor";
import RegisterBank from "@/components/RegisterBank";
import { assemble } from "@/lib/assembler";
import { createVM, step, type VMState } from "@/lib/vm";

const DEFAULT_SOURCE = `LOAD R0, 00H       // 分岐条件のベース = 0
LOAD R1, [FFH]     // FFH番地からデータをコピー
LOAD R2, 01H       // マスクパターン = 01H（最下位ビット判定）
AND R3, R1, R2      // マスクを実施
JUMP R3, [0CH]     // 結果が0(偶数)ならHALTへ分岐
STORE R1, [FFH]    // 奇数のときの処理
HALT`;

export default function Home() {
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [ffInput, setFfInput] = useState("00");
  const [vm, setVm] = useState<VMState | null>(null);
  const [running, setRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(300);

  const assembleResult = useMemo(() => assemble(source), [source]);

  function handleAssemble() {
    const result = assemble(source);
    const ff = Number.parseInt(ffInput || "0", 16) || 0;
    setVm(createVM(result.memoryPatch, ff));
    setRunning(false);
  }

  function handleStep() {
    setVm((prev) => (prev ? step(prev) : prev));
  }

  function handleReset() {
    const result = assemble(source);
    const ff = Number.parseInt(ffInput || "0", 16) || 0;
    setVm(createVM(result.memoryPatch, ff));
    setRunning(false);
  }

  useEffect(() => {
    if (!running || !vm || vm.halted) return;
    const id = setInterval(() => {
      setVm((prev) => (prev && !prev.halted ? step(prev) : prev));
    }, speedMs);
    return () => clearInterval(id);
  }, [running, vm, speedMs]);

  useEffect(() => {
    if (vm?.halted) setRunning(false);
  }, [vm?.halted]);

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-chassis text-ink px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 flex flex-col">
      <header className="shrink-0 max-w-[1600px] w-full mx-auto mb-2 flex flex-wrap items-baseline justify-between gap-x-4 border-b border-amber-dim/40 pb-1.5">
        <div>
          <h1 className="font-panel uppercase tracking-[0.2em] text-base sm:text-xl lg:text-2xl text-amber glow-amber">
            Virtual CPU Panel
          </h1>
          <p className="font-panel text-[10px] sm:text-xs text-ink/50 tracking-wide">
            4bit opcode + 4bit×3 operand ／ 256byte memory ／ step execution
          </p>
        </div>
        <span className="hidden sm:block font-readout text-2xl lg:text-3xl text-amber-dim">
          仮想計算機
        </span>
      </header>

      <div className="lg:flex-1 lg:min-h-0 max-w-[1600px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[280px_1fr_260px] lg:grid-rows-[minmax(0,1fr)_auto_auto] gap-2 sm:gap-3 lg:gap-4">
        <div className="order-4 md:order-none lg:min-h-0 md:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-span-2">
          <OpcodeReference />
        </div>

        <div className="lg:min-h-0 md:col-span-2 lg:col-span-1 lg:col-start-2">
          <ProgramEditor
            value={source}
            onChange={setSource}
            assembleResult={assembleResult}
            currentPc={vm?.pc ?? null}
          />
        </div>

        <div className="self-start lg:col-start-3">
          <RegisterBank vm={vm} />
        </div>
        <div className="self-start lg:col-start-3">
          <ControlPanel
            ffInput={ffInput}
            onFfInputChange={setFfInput}
            onAssemble={handleAssemble}
            onStep={handleStep}
            onRunToggle={() => setRunning((r) => !r)}
            onReset={handleReset}
            running={running}
            speedMs={speedMs}
            onSpeedChange={setSpeedMs}
            vm={vm}
            hasAssembleErrors={!assembleResult.ok}
          />
        </div>

        <div className="self-start md:col-span-2 lg:col-span-3">
          <MemoryTape vm={vm} />
        </div>
      </div>
    </main>
  );
}
