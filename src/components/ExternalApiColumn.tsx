import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ExternalApiLogEntry, ExternalRecord, SimulationPhase } from "@/types/dcr";
import { Server, Terminal, AlertTriangle, CheckCircle2, ShieldCheck, DollarSign, UserCheck, Bell, HardDrive } from "lucide-react";

interface ExternalApiColumnProps {
  logs: ExternalApiLogEntry[];
  records: ExternalRecord[];
  simulationPhase: SimulationPhase;
  gatewayEnabled: boolean;
}

export const ExternalApiColumn: React.FC<ExternalApiColumnProps> = ({
  logs,
  records,
  simulationPhase,
  gatewayEnabled,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const hasDuplicate = records.some((r) => r.isDuplicate);

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-[#080d16] overflow-hidden shadow-2xl relative">
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-[#0c1220] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
              3. External SaaS API
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">Remote Production Billing System (Stripe / SaaS)</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-400">Database:</span>
          <span
            className={`px-2 py-0.5 rounded border font-bold ${
              hasDuplicate
                ? "bg-rose-950/60 text-rose-300 border-rose-500/60 animate-pulse"
                : "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
            }`}
          >
            {hasDuplicate ? "POLLUTED (DUP)" : "CONSISTENT"}
          </span>
        </div>
      </div>

      {/* Main Column Body */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 flex flex-col justify-between">
        {/* Top: Terminal Style Event Log */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Immutable Event Stream Log
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-500">PORT 443 HTTPS</span>
            </div>
          </div>

          {/* Terminal Box */}
          <div className="mt-2 flex-1 min-h-[220px] rounded-lg border border-slate-800 bg-[#05080e] p-3 font-mono text-xs overflow-y-auto space-y-2.5 shadow-inner">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic py-6 text-center">
                &gt; Listening for inbound HTTP requests...
              </div>
            ) : (
              logs.map((log) => {
                const isError = log.status === "TIMEOUT" || (typeof log.status === "number" && log.status >= 500);
                const isDupe = log.isDuplicate;
                const isIntercept = log.isIntercepted;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded border transition-all ${
                      isDupe
                        ? "border-rose-500/70 bg-rose-950/40 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                        : isIntercept
                        ? "border-cyan-500/60 bg-cyan-950/40 text-cyan-200"
                        : isError
                        ? "border-amber-500/60 bg-amber-950/40 text-amber-200"
                        : "border-slate-800/80 bg-slate-900/50 text-slate-300"
                    }`}
                  >
                    {/* Log Line 1: Timestamp & Endpoint */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{log.time}</span>
                      <span className="font-bold text-slate-200">
                        {log.method} {log.endpoint}
                      </span>
                    </div>

                    {/* Log Line 2: Status & Receipt */}
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            isDupe
                              ? "bg-rose-900 text-rose-200"
                              : isIntercept
                              ? "bg-cyan-900 text-cyan-200"
                              : isError
                              ? "bg-amber-900 text-amber-200"
                              : "bg-emerald-900 text-emerald-200"
                          }`}
                        >
                          {log.status}
                        </span>
                        {log.receiptId && (
                          <span className="text-emerald-400 font-semibold">{log.receiptId}</span>
                        )}
                      </div>

                      {isDupe && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-500/60 animate-pulse">
                          DUPLICATE MUTATION!
                        </span>
                      )}

                      {isIntercept && (
                        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/60">
                          RECEIPT REPLAYED
                        </span>
                      )}
                    </div>

                    {log.notes && (
                      <div className="mt-1 text-[10px] text-slate-400 border-t border-slate-800/60 pt-1">
                        &gt; {log.notes}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Bottom: SaaS Remote Database Records View */}
        <div>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              SaaS Committed Records State
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {records.length} {records.length === 1 ? "record" : "records"}
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            {records.length === 0 ? (
              <div className="rounded border border-dashed border-slate-800 p-2 text-center text-slate-600 font-mono text-xs">
                No external records committed yet.
              </div>
            ) : (
              records.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-2 rounded border font-mono text-xs flex items-center justify-between transition-all ${
                    rec.isDuplicate
                      ? "border-rose-500 bg-rose-950/40 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse"
                      : "border-slate-800 bg-[#0d1424] text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {rec.type === "Customer" && <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    {rec.type === "Invoice" && <DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                    {rec.type === "Notification" && <Bell className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="font-semibold text-white">{rec.identifier}</span>
                    {rec.isDuplicate && (
                      <span className="text-[9px] px-1 rounded bg-rose-600 text-white font-bold">
                        DUPLICATE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-500">{rec.createdAt}</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/40">
                      {rec.receiptId}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-[#060a12] text-[11px] font-mono text-slate-400">
        <div className="flex items-start gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-300 font-semibold">External Reality:</span>
            <p className="text-slate-400 leading-tight mt-0.5">
              Every request that reaches this API commits real side effects (billing, invoicing, customer notification).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
