import React from "react";
import { ShieldCheck, ShieldAlert, Cpu, GitCommit, BookOpen, RotateCcw } from "lucide-react";

interface HeaderProps {
  gatewayEnabled: boolean;
  onOpenDocs: () => void;
  onReset: () => void;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gatewayEnabled,
  onOpenDocs,
  onReset,
  isRunning,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur-md px-4 lg:px-8 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                gatewayEnabled
                  ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  : "bg-amber-950/30 border-amber-500/40 text-amber-400"
              }`}
            >
              {gatewayEnabled ? (
                <ShieldCheck className="w-5 h-5 animate-pulse text-cyan-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#080c14] ${
                gatewayEnabled ? "bg-cyan-400 animate-ping" : "bg-amber-500"
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight font-mono text-white flex items-center gap-1.5">
                SafeAgent<span className="text-cyan-400">-DCR</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800/70 text-slate-300">
                POC v1.0
              </span>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                  gatewayEnabled
                    ? "border-cyan-500/40 bg-cyan-950/40 text-cyan-300"
                    : "border-amber-500/40 bg-amber-950/40 text-amber-300"
                }`}
              >
                {gatewayEnabled ? "GATEWAY ARMED" : "GATEWAY BYPASS"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans tracking-wide">
              Preventing duplicate external actions when AI agent state rolls back.
            </p>
          </div>
        </div>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-2.5 self-end md:self-center">
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>SPEC: RFC-0891</span>
            <span className="text-slate-600">|</span>
            <GitCommit className="w-3.5 h-3.5 text-slate-400" />
            <span>DETERMINISTIC</span>
          </div>

          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
            title="Read technical architecture"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Architecture Deep-Dive</span>
          </button>

          <button
            onClick={onReset}
            disabled={isRunning}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition disabled:opacity-40"
            title="Reset simulation to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
