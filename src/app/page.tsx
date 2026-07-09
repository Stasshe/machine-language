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
    <main className="min-h-screen bg-chassis text-ink px-4 py-6 sm:px-8">
      <header className="max-w-7xl mx-auto mb-6 flex items-baseline justify-between border-b border-amber-dim/40 pb-4">
        <div>
          <h1 className="font-panel uppercase tracking-[0.2em] text-xl sm:text-2xl text-amber glow-amber">
            Virtual CPU Panel
          </h1>
          <p className="font-panel text-xs text-ink/50 tracking-wide mt-1">
            4bit opcode + 4bit×3 operand ／ 256byte memory ／ step execution
          </p>
        </div>
        <span className="font-readout text-3xl text-amber-dim">仮想計算機</span>
      </header>

      <div className="max-w-7xl mx-auto grid gap-4 lg:grid-cols-[320px_1fr_300px]">
        <OpcodeReference />

        <ProgramEditor
          value={source}
          onChange={setSource}
          assembleResult={assembleResult}
          currentPc={vm?.pc ?? null}
        />

        <div className="flex flex-col gap-4">
          <RegisterBank vm={vm} />
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

        <div className="lg:col-span-3">
          <MemoryTape vm={vm} />
        </div>
      </div>
    </main>
  );
}
