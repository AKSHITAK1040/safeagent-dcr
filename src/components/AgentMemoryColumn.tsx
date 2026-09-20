import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentCheckpoint, SimulationPhase } from "@/types/dcr";
import { BrainCircuit, RotateCcw, AlertTriangle, CheckCircle2, Clock, Terminal, ArrowDown, Sparkles } from "lucide-react";

interface AgentMemoryColumnProps {
  checkpoints: AgentCheckpoint[];
  activeCheckpointId: number;
  isRollingBack: boolean;
  simulationPhase: SimulationPhase;
}

export const AgentMemoryColumn: React.FC<AgentMemoryColumnProps> = ({
  checkpoints,
  activeCheckpointId,
  isRollingBack,
  simulationPhase,
}) => {
  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-[#0b101b] overflow-hidden shadow-2xl relative">
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-[#0e1524] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
              1. Agent Memory
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">LLM Working State & Checkpoints</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-400">Active:</span>
          <span
            className={`px-2 py-0.5 rounded border font-bold ${
              isRollingBack
                ? "bg-amber-950/60 text-amber-300 border-amber-500/50 animate-pulse"
                : activeCheckpointId === 0
                ? "bg-slate-800 text-slate-400 border-slate-700"
                : "bg-purple-950/40 text-purple-300 border-purple-500/40"
            }`}
          >
            {activeCheckpointId === 0 ? "None" : `CP-${activeCheckpointId}`}
          </span>
        </div>
      </div>

      {/* Rollback Alert Banner (When rewinding) */}
      <AnimatePresence>
        {isRollingBack && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-amber-500/40 bg-amber-950/40 px-4 py-2 flex items-center gap-2 overflow-hidden text-amber-300 font-mono text-xs"
          >
            <RotateCcw className="w-4 h-4 shrink-0 animate-spin text-amber-400" />
            <div className="flex-1">
              <span className="font-bold">ROLLBACK IN PROGRESS:</span> Checkpoint 3 → Checkpoint 1
              <p className="text-[10px] text-amber-400/80">Evicting invalidated context from working memory</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Container */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 relative">
        {/* Subtle background connecting line */}
        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-800" />

        {checkpoints.map((cp, idx) => {
          const isActive = activeCheckpointId === cp.id;
          const isPassed = activeCheckpointId > cp.id;
          const isEvicted = cp.status === "ROLLED_BACK";
          const isFailed = cp.status === "FAILED";

          return (
            <div key={cp.id} className="relative flex items-start gap-3 group">
              {/* Checkpoint Icon / Node */}
              <div className="relative z-10 shrink-0">
                <motion.div
                  animate={{
                    scale: isActive ? [1, 1.12, 1] : 1,
                  }}
                  transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-colors duration-300 ${
                    isFailed
                      ? "bg-rose-950 border-rose-500 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                      : isEvicted
                      ? "bg-slate-900 border-amber-500/60 text-amber-400 line-through opacity-60"
                      : isActive
                      ? "bg-purple-900/60 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      : isPassed
                      ? "bg-emerald-950 border-emerald-500/70 text-emerald-400"
                      : "bg-slate-900 border-slate-700 text-slate-500"
                  }`}
                >
                  {isFailed ? "!" : cp.id}
                </motion.div>

                {/* Animated ripple for active node */}
                {isActive && (
                  <span className="absolute -inset-1 rounded-full border border-purple-400/50 animate-ping pointer-events-none" />
                )}
              </div>

              {/* Checkpoint Card */}
              <motion.div
                layout
                className={`flex-1 rounded-lg border p-3 font-mono text-xs transition-all duration-300 ${
                  isFailed
                    ? "border-rose-500/60 bg-rose-950/20 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                    : isEvicted
                    ? "border-amber-500/30 bg-amber-950/10 text-slate-400 opacity-60"
                    : isActive
                    ? "border-purple-500/60 bg-purple-950/30 text-slate-100 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                    : cp.status === "COMMITTED"
                    ? "border-emerald-500/30 bg-emerald-950/10 text-slate-200"
                    : "border-slate-800/80 bg-slate-900/40 text-slate-400"
                }`}
              >
                {/* Header: Title & Step */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-white">{cp.name}</span>
                    <span className="text-[10px] text-slate-500">#{cp.stepNumber}</span>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                      cp.status === "COMMITTED"
                        ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                        : cp.status === "FAILED"
                        ? "border-rose-500/50 bg-rose-950/50 text-rose-300"
                        : cp.status === "ROLLED_BACK"
                        ? "border-amber-500/50 bg-amber-950/50 text-amber-300"
                        : cp.status === "ACTIVE"
                        ? "border-purple-500/50 bg-purple-950/50 text-purple-300 animate-pulse"
                        : "border-slate-800 bg-slate-800 text-slate-500"
                    }`}
                  >
                    {cp.status}
                  </span>
                </div>

                {/* Body details: Action & Payload preview */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Action:</span>
                    <span className="text-cyan-300 font-semibold">{cp.action}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Summary:</span>
                    <span className="text-slate-200">{cp.summary}</span>
                  </div>

                  {/* Payload key-value */}
                  <div className="p-1.5 rounded bg-black/40 border border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
                    {Object.entries(cp.payload).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-500">{key}:</span>
                        <span className="text-slate-300 font-mono">{String(val)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timestamp */}
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {cp.timestamp || "--:--:--"}
                    </span>
                    {isEvicted && (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Memory Evicted
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Footer Info: AI Source of Truth Warning */}
      <div className="p-3 border-t border-slate-800 bg-[#090d16] text-[11px] font-mono text-slate-400">
        <div className="flex items-start gap-2">
          <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-300 font-semibold">Agent Context Boundary:</span>
            <p className="text-slate-400 leading-tight mt-0.5">
              Rollbacks reset internal agent state to CP1. Without external reconciliation, the agent has no memory that Step 2 was previously dispatched.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
