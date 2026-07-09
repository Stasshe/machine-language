"use client";

import { useEffect, useMemo, useState } from "react";
import ControlPanel from "@/components/ControlPanel";
import MemoryTape from "@/components/MemoryTape";
import OpcodeReference from "@/components/OpcodeReference";
import ProgramEditor from "@/components/ProgramEditor";
import RegisterBank from "@/components/RegisterBank";
import { assemble } from "@/lib/assembler";
import { hexByte } from "@/lib/isa";
import { createVM, step, type VMState } from "@/lib/vm";

const DEFAULT_SOURCE = `LOAD R0, 00H
LOAD R1, [FFH]
LOAD R2, 01H
AND R3, R1, R2
JUMP R3, 0CH
STORE R0, [FFH]
HALT`;

function stateLabel(vm: VMState | null, running: boolean): string {
  if (vm?.halted) return "HALT";
  if (running) return "RUN";
  return "STOP";
}

function pcLabel(vm: VMState | null): string {
  if (!vm) return "--H";
  return `${hexByte(vm.pc)}H`;
}

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
    setVm((prev) => {
      if (!prev) return prev;
      return step(prev);
    });
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
      setVm((prev) => {
        if (!prev || prev.halted) return prev;
        return step(prev);
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [running, vm, speedMs]);

  useEffect(() => {
    if (vm?.halted) setRunning(false);
  }, [vm?.halted]);

  const runState = stateLabel(vm, running);

  return (
    <main className="min-h-screen bg-chassis text-ink px-2 py-2 sm:px-4 lg:px-5 flex flex-col">
      <header className="shrink-0 max-w-[1700px] w-full mx-auto mb-2 grid gap-2 border-b border-amber-dim pb-2 md:grid-cols-[1fr_auto] md:items-end">
        <div className="min-w-0">
          <h1 className="font-panel text-lg sm:text-xl font-bold text-ink">Virtual CPU Panel</h1>
          <p className="font-panel text-xs text-ink/70">
            4-bit opcode / 4-bit operand nibbles / 256-byte memory
          </p>
        </div>
        <dl className="grid grid-cols-3 border border-amber-dim bg-panel text-xs font-panel">
          <div className="min-w-20 border-r border-amber-dim px-2 py-1">
            <dt className="text-ink/55">State</dt>
            <dd className="font-semibold text-amber">{runState}</dd>
          </div>
          <div className="min-w-20 border-r border-amber-dim px-2 py-1">
            <dt className="text-ink/55">PC</dt>
            <dd className="font-mono font-semibold">{pcLabel(vm)}</dd>
          </div>
          <div className="min-w-20 px-2 py-1">
            <dt className="text-ink/55">Cycles</dt>
            <dd className="font-mono font-semibold">{vm?.cycles ?? 0}</dd>
          </div>
        </dl>
      </header>

      <div className="max-w-[1700px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[360px_minmax(0,1fr)_330px] gap-2">
        <div className="order-4 md:order-none md:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-start-1">
          <OpcodeReference />
        </div>

        <div className="md:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
          <ProgramEditor
            value={source}
            onChange={setSource}
            assembleResult={assembleResult}
            currentPc={vm?.pc ?? null}
          />
        </div>

        <div className="lg:col-start-3 lg:row-start-1 flex flex-col gap-2">
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

        <div className="md:col-span-2 lg:col-span-3 lg:row-start-2">
          <MemoryTape vm={vm} />
        </div>
      </div>
    </main>
  );
}
