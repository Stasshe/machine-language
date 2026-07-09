"use client";

import type { VMState } from "@/lib/vm";

interface Props {
  ffInput: string;
  onFfInputChange: (value: string) => void;
  onAssemble: () => void;
  onStep: () => void;
  onRunToggle: () => void;
  onReset: () => void;
  running: boolean;
  speedMs: number;
  onSpeedChange: (value: number) => void;
  vm: VMState | null;
  hasAssembleErrors: boolean;
}

function SwitchButton({
  onClick,
  disabled,
  active,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`font-panel uppercase tracking-wider text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded border-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-amber text-panel border-amber"
          : "bg-chassis text-ink border-amber-dim hover:border-amber hover:text-amber"
      }`}
    >
      {children}
    </button>
  );
}

export default function ControlPanel({
  ffInput,
  onFfInputChange,
  onAssemble,
  onStep,
  onRunToggle,
  onReset,
  running,
  speedMs,
  onSpeedChange,
  vm,
  hasAssembleErrors,
}: Props) {
  return (
    <div className="bg-panel border-2 border-amber-dim rounded p-2 sm:p-3 lg:p-4 flex flex-col gap-1.5 sm:gap-2">
      <h2 className="font-panel uppercase tracking-widest text-xs text-ink font-semibold">
        Control Panel
      </h2>

      <div>
        <label
          htmlFor="ff-input"
          className="font-panel text-[10px] uppercase tracking-wider text-ink/70 font-semibold block mb-1"
        >
          Memory[FFH] initial value
        </label>
        <div className="flex items-center gap-2">
          <input
            id="ff-input"
            value={ffInput}
            onChange={(e) => onFfInputChange(e.target.value.toUpperCase().slice(0, 2))}
            placeholder="00"
            maxLength={2}
            className="w-20 rounded bg-chassis border-2 border-amber-dim text-amber font-readout text-lg px-2 py-0.5 outline-none focus:border-amber"
          />
          <span className="font-panel text-ink/70 text-sm">H</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <SwitchButton onClick={onAssemble}>Assemble &amp; Reset</SwitchButton>
        <SwitchButton onClick={onStep} disabled={!vm || vm.halted}>
          Step
        </SwitchButton>
        <SwitchButton onClick={onRunToggle} disabled={!vm || vm.halted} active={running}>
          {running ? "Pause" : "Run"}
        </SwitchButton>
        <SwitchButton onClick={onReset} disabled={!vm}>
          Reset
        </SwitchButton>
      </div>

      <div>
        <label
          htmlFor="speed"
          className="font-panel text-[10px] uppercase tracking-wider text-ink/70 font-semibold flex justify-between mb-1"
        >
          <span>Run speed</span>
          <span>{speedMs}ms / step</span>
        </label>
        <input
          id="speed"
          type="range"
          min={50}
          max={1000}
          step={50}
          value={speedMs}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full accent-amber"
        />
      </div>

      <div className="border-t-2 border-amber-dim pt-1.5 sm:pt-2 min-h-[2rem]">
        {hasAssembleErrors && (
          <p className="font-panel text-xs text-danger font-semibold">
            プログラムにエラーあり — 下の一覧を確認してください
          </p>
        )}
        {!hasAssembleErrors && vm?.error && (
          <p className="font-panel text-xs text-danger font-semibold">{vm.error}</p>
        )}
        {!hasAssembleErrors && !vm?.error && vm?.halted && (
          <p className="font-panel text-xs text-amber font-semibold">
            HALT — 実行終了 ({vm.cycles} cycles)
          </p>
        )}
        {!hasAssembleErrors && !vm?.error && !vm?.halted && vm && (
          <p className="font-panel text-xs text-ink/80">RUNNING — PC {vm.cycles} cycles</p>
        )}
        {!vm && !hasAssembleErrors && (
          <p className="font-panel text-xs text-ink/60">
            プログラムを入力し Assemble &amp; Reset で開始
          </p>
        )}
      </div>
    </div>
  );
}
