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
      className={`font-panel uppercase tracking-wider text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? "bg-amber text-chassis border-amber"
          : "bg-chassis/70 text-ink/80 border-amber-dim/40 hover:border-amber/60 hover:text-amber"
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
    <div className="bg-panel border border-amber-dim/40 rounded p-2 sm:p-3 lg:p-4 flex flex-col gap-2 sm:gap-3">
      <h2 className="font-panel uppercase tracking-widest text-xs text-ink/70">Control Panel</h2>

      <div>
        <label
          htmlFor="ff-input"
          className="font-panel text-[10px] uppercase tracking-wider text-ink/50 block mb-1"
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
            className="w-20 rounded bg-chassis/70 border border-amber-dim/30 text-amber font-readout text-xl px-2 py-1 outline-none focus:border-amber/60"
          />
          <span className="font-panel text-ink/50 text-sm">H</span>
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
          className="font-panel text-[10px] uppercase tracking-wider text-ink/50 flex justify-between mb-1"
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

      <div className="border-t border-amber-dim/30 pt-2 sm:pt-3 min-h-[2.5rem]">
        {hasAssembleErrors && (
          <p className="font-panel text-xs text-danger">
            プログラムにエラーあり — 下の一覧を確認してください
          </p>
        )}
        {!hasAssembleErrors && vm?.error && (
          <p className="font-panel text-xs text-danger">{vm.error}</p>
        )}
        {!hasAssembleErrors && !vm?.error && vm?.halted && (
          <p className="font-panel text-xs text-amber">HALT — 実行終了 ({vm.cycles} cycles)</p>
        )}
        {!hasAssembleErrors && !vm?.error && !vm?.halted && vm && (
          <p className="font-panel text-xs text-ink/50">RUNNING — PC {vm.cycles} cycles</p>
        )}
        {!vm && !hasAssembleErrors && (
          <p className="font-panel text-xs text-ink/40">
            プログラムを入力し Assemble &amp; Reset で開始
          </p>
        )}
      </div>
    </div>
  );
}
