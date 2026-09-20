import React from "react";
import { ExecutionState } from "@/types/dcr";
import { ShieldCheck, ShieldAlert, Activity, ArrowRightLeft, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

interface MetricsBarProps {
  executionState: ExecutionState;
  transactionsPrevented: number;
  agentCheckpointStep: number;
  externalCommitStep: number;
  gatewayEnabled: boolean;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  executionState,
  transactionsPrevented,
  agentCheckpointStep,
  externalCommitStep,
  gatewayEnabled,
}) => {
  const driftDelta = agentCheckpointStep - externalCommitStep;

  // Visual styling for execution state
  const getStateBadge = () => {
    switch (executionState) {
      case "SYNCHRONIZED":
        return {
          label: "SYNCHRONIZED",
          color: "text-emerald-400 border-emerald-500/40 bg-emerald-950/30",
          glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          desc: "Agent memory matches external ledger",
        };
      case "DESYNCED":
        return {
          label: "DESYNCED",
          color: "text-rose-400 border-rose-500/50 bg-rose-950/40 animate-pulse",
          glow: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
          desc: "Critical state split: duplicate mutation triggered",
        };
      case "RECOVERED":
        return {
          label: "RECOVERED",
          color: "text-cyan-400 border-cyan-500/50 bg-cyan-950/40",
          glow: "shadow-[0_0_20px_rgba(0,240,255,0.3)]",
          icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
          desc: "Reconciled via DCR: 0 duplicates created",
        };
      case "RUNNING":
        return {
          label: "RUNNING",
          color: "text-sky-400 border-sky-500/40 bg-sky-950/30",
          glow: "shadow-[0_0_10px_rgba(56,189,248,0.2)]",
          icon: <Activity className="w-4 h-4 animate-spin text-sky-400" />,
          desc: "Simulating step pipeline traversal",
        };
      case "FAILED":
      case "ROLLED_BACK":
        return {
          label: executionState === "FAILED" ? "FAILED (STEP 3 TIMEOUT)" : "ROLLED BACK (CP3 → CP1)",
          color: "text-amber-400 border-amber-500/40 bg-amber-950/30",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.25)]",
          icon: <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />,
          desc: "Agent context rewind in progress",
        };
      case "IDLE":
      default:
        return {
          label: "SYNCHRONIZED (IDLE)",
          color: "text-slate-400 border-slate-700 bg-slate-900/50",
          glow: "",
          icon: <CheckCircle2 className="w-4 h-4 text-slate-400" />,
          desc: "System ready for simulation run",
        };
    }
  };

  const stateBadge = getStateBadge();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 pt-4 pb-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Metric 1: Transactions Prevented */}
        <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-[#0d131f]/90 p-3.5 flex flex-col justify-between shadow-card-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Transactions Prevented
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                transactionsPrevented > 0
                  ? "border-cyan-500/50 bg-cyan-950/50 text-cyan-300"
                  : "border-slate-700 bg-slate-800/50 text-slate-400"
              }`}
            >
              {transactionsPrevented > 0 ? "PROTECTED" : "UNPROTECTED"}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl lg:text-3xl font-bold font-mono ${
                transactionsPrevented > 0 ? "text-cyan-400 text-glow-cyan" : "text-slate-300"
              }`}
            >
              {transactionsPrevented}
            </span>
            <span className="text-xs font-mono text-slate-400">
              duplicate {transactionsPrevented === 1 ? "action" : "actions"} blocked
            </span>
          </div>

          <p className="mt-1 text-[11px] text-slate-400 font-sans">
            {gatewayEnabled
              ? "DCR ledger intercepts idempotent requests before API mutation."
              : "Gateway OFF: Duplicate requests bypass interceptor straight to SaaS."}
          </p>

          {/* Micro accent bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
              transactionsPrevented > 0 ? "bg-cyan-500 shadow-[0_0_8px_rgba(0,240,255,0.8)]" : "bg-slate-800"
            }`}
          />
        </div>

        {/* Metric 2: Memory Drift Delta */}
        <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-[#0d131f]/90 p-3.5 flex flex-col justify-between shadow-card-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              Memory Drift Delta
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-slate-400">
              Agent - SaaS Commit
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl lg:text-3xl font-bold font-mono ${
                driftDelta === 0
                  ? "text-emerald-400 text-glow-emerald"
                  : driftDelta < 0
                  ? "text-amber-400 text-glow-rose"
                  : "text-rose-400 text-glow-rose"
              }`}
            >
              {driftDelta > 0 ? `+${driftDelta}` : driftDelta}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({agentCheckpointStep} - {externalCommitStep} = {driftDelta})
            </span>
          </div>

          <p className="mt-1 text-[11px] text-slate-400 font-sans">
            {driftDelta === 0
              ? "Memory aligned: Agent state step matches external ledger step."
              : `State divergence detected: Agent at Step ${agentCheckpointStep} vs External Commit ${externalCommitStep}.`}
          </p>

          {/* Micro accent bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
              driftDelta === 0 ? "bg-emerald-500" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            }`}
          />
        </div>

        {/* Metric 3: Execution State */}
        <div className={`relative overflow-hidden rounded-lg border bg-[#0d131f]/90 p-3.5 flex flex-col justify-between transition-all duration-300 ${stateBadge.color} ${stateBadge.glow}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Execution State
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-current opacity-80">
              LIVE STATUS
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            {stateBadge.icon}
            <span className="text-xl lg:text-2xl font-bold font-mono tracking-tight">
              {stateBadge.label}
            </span>
          </div>

          <p className="mt-1 text-[11px] text-slate-300/90 font-sans">
            {stateBadge.desc}
          </p>

          {/* Micro accent bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-70" />
        </div>
      </div>
    </div>
  );
};
