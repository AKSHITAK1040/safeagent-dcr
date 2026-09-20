import React from "react";
import { Play, RotateCcw, ShieldCheck, ShieldAlert, Sparkles, FastForward, Info } from "lucide-react";
import { SimulationPhase } from "@/types/dcr";

interface ControlsProps {
  gatewayEnabled: boolean;
  onToggleGateway: (enabled: boolean) => void;
  onStartSimulation: () => void;
  onReset: () => void;
  isRunning: boolean;
  simulationPhase: SimulationPhase;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  gatewayEnabled,
  onToggleGateway,
  onStartSimulation,
  onReset,
  isRunning,
  simulationPhase,
  playbackSpeed,
  onSpeedChange,
}) => {
  // Description text based on phase
  const getPhaseDescription = () => {
    switch (simulationPhase) {
      case "STEP_1_SENDING":
      case "STEP_1_GATEWAY":
      case "STEP_1_EXTERNAL":
      case "STEP_1_COMMITTED":
        return "Executing Step 1: Create Customer (Acme Corp) → External API committed with RECEIPT-71";
      case "STEP_2_SENDING":
      case "STEP_2_GATEWAY":
      case "STEP_2_EXTERNAL":
      case "STEP_2_COMMITTED":
        return "Executing Step 2: Create Invoice ($4,250) → External API committed with RECEIPT-72";
      case "STEP_3_SENDING":
      case "STEP_3_GATEWAY":
      case "STEP_3_TIMEOUT":
        return "Executing Step 3: Send Notification → Injected 504 Network Timeout!";
      case "ROLLBACK_ANIMATING":
        return "Failure detected! Agent memory rewinding: Checkpoint 3 → Checkpoint 1 (Evicting Steps 2 & 3)";
      case "ROLLED_BACK_STATE":
      case "RETRY_PREPARING":
        return "Agent in rolled-back state (CP1). Memory believes Invoice is uncreated. Initiating retry of Step 2...";
      case "RETRY_SENDING":
        return gatewayEnabled
          ? "Retry packet sent to Gateway. Gateway checking committed execution ledger..."
          : "Retry packet sent to Gateway. Gateway in BYPASS mode (OFF) — passing request through!";
      case "RETRY_GATEWAY_INTERCEPT":
      case "RETRY_RECEIPT_REPLAY":
        return "⚡ STATE DRIFT DETECTED: Gateway intercepted duplicate! Replaying committed RECEIPT-72 to Agent.";
      case "RETRY_GATEWAY_BYPASS":
      case "RETRY_EXTERNAL_DUPLICATE":
        return "⚠️ CRITICAL FAILURE: Gateway was OFF. Duplicate invoice created in External SaaS (RECEIPT-73)!";
      case "COMPLETE_DESYNCED":
        return "DESYNCED: Duplicate external invoice exists! Turn Gateway ON and run again to see DCR prevent this.";
      case "COMPLETE_RECOVERED":
        return "RECOVERED — 1 duplicate execution prevented";
      case "IDLE":
      default:
        return gatewayEnabled
          ? "Ready: Gateway is ARMED (ON). Click 'Run Agent' to watch DCR intercept duplicate retry."
          : "Ready: Gateway is BYPASS (OFF). Click 'Run Agent' to watch duplicate invoice creation.";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-3">
      <div className="rounded-xl border border-slate-800 bg-[#0d131f]/95 p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Main CTA & Gateway Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary CTA */}
          <button
            onClick={onStartSimulation}
            disabled={isRunning}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-lg font-mono font-bold text-sm transition-all duration-300 shadow-lg ${
              isRunning
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : gatewayEnabled
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] active:scale-95"
                : "bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] active:scale-95"
            }`}
          >
            <Play className={`w-4 h-4 fill-current ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Simulation in Progress..." : "Run Agent (Simulate Failure & Rollback)"}</span>
          </button>

          {/* Gateway Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 px-3">
            <span className="text-xs font-mono text-slate-400">Gateway:</span>
            <div className="flex items-center rounded-md bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => !isRunning && onToggleGateway(false)}
                disabled={isRunning}
                className={`px-3 py-1 text-xs font-mono rounded transition-all flex items-center gap-1.5 ${
                  !gatewayEnabled
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>OFF (Bypass)</span>
              </button>

              <button
                onClick={() => !isRunning && onToggleGateway(true)}
                disabled={isRunning}
                className={`px-3 py-1 text-xs font-mono rounded transition-all flex items-center gap-1.5 ${
                  gatewayEnabled
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.3)] font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ON (DCR)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Speed & Auxiliary controls */}
        <div className="flex items-center justify-between md:justify-end gap-3 font-mono text-xs">
          {/* Speed Presets */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1">
            <FastForward className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <span className="text-slate-400 text-[11px]">Speed:</span>
            {[1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                disabled={isRunning}
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  playbackSpeed === s
                    ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white transition disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Live Phase Step Banner */}
      <div
        className={`mt-2 px-3.5 py-2 rounded-lg border text-xs font-mono flex items-center gap-2.5 transition-all duration-300 ${
          simulationPhase === "RETRY_GATEWAY_INTERCEPT" || simulationPhase === "COMPLETE_RECOVERED"
            ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-300"
            : simulationPhase === "RETRY_EXTERNAL_DUPLICATE" || simulationPhase === "COMPLETE_DESYNCED"
            ? "border-rose-500/40 bg-rose-950/30 text-rose-300"
            : simulationPhase.includes("TIMEOUT") || simulationPhase.includes("ROLLBACK")
            ? "border-amber-500/40 bg-amber-950/30 text-amber-300"
            : "border-slate-800 bg-slate-900/60 text-slate-300"
        }`}
      >
        <Info className="w-4 h-4 shrink-0" />
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Live Trace:</span>
        <span className="truncate">{getPhaseDescription()}</span>
      </div>
    </div>
  );
};
