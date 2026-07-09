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
  let className =
    "font-panel text-xs font-semibold px-2.5 py-1 border transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  if (active) {
    className += " bg-amber text-white border-amber";
  } else {
    className += " bg-white text-ink border-amber-dim hover:border-amber hover:text-amber";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

function runButtonLabel(running: boolean): string {
  if (running) return "Pause";
  return "Run";
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
  let status = "Assemble and reset to start.";
  let statusClassName = "text-ink/60";
  if (hasAssembleErrors) {
    status = "Program has assemble errors.";
    statusClassName = "text-danger font-semibold";
  } else if (vm?.error) {
    status = vm.error;
    statusClassName = "text-danger font-semibold";
  } else if (vm?.halted) {
    status = `HALT after ${vm.cycles} cycles.`;
    statusClassName = "text-amber font-semibold";
  } else if (running) {
    status = `Running at cycle ${vm?.cycles ?? 0}.`;
    statusClassName = "text-ink/80";
  } else if (vm) {
    status = `Ready at cycle ${vm.cycles}.`;
    statusClassName = "text-ink/80";
  }

  return (
    <div className="bg-panel border border-amber-dim flex flex-col">
      <h2 className="border-b border-amber-dim px-2 py-1.5 font-panel text-xs text-ink font-semibold">
        Control
      </h2>

      <div className="border-b border-amber-dim p-2">
        <label
          htmlFor="ff-input"
          className="font-panel text-[10px] text-ink/70 font-semibold block mb-1"
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
            className="w-20 border border-amber-dim bg-white text-amber font-mono text-sm px-2 py-1 outline-none focus:border-amber"
          />
          <span className="font-panel text-ink/70 text-sm">H</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-amber-dim p-2">
        <SwitchButton onClick={onAssemble}>Assemble &amp; Reset</SwitchButton>
        <SwitchButton onClick={onStep} disabled={!vm || vm.halted}>
          Step
        </SwitchButton>
        <SwitchButton onClick={onRunToggle} disabled={!vm || vm.halted} active={running}>
          {runButtonLabel(running)}
        </SwitchButton>
        <SwitchButton onClick={onReset} disabled={!vm}>
          Reset
        </SwitchButton>
      </div>

      <div className="border-b border-amber-dim p-2">
        <label
          htmlFor="speed"
          className="font-panel text-[10px] text-ink/70 font-semibold flex justify-between mb-1"
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

      <table className="w-full text-left font-panel text-xs">
        <tbody>
          <tr>
            <th className="w-16 bg-chassis px-2 py-1 text-[10px] text-ink/60">Status</th>
            <td className={`px-2 py-1 ${statusClassName}`}>{status}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
