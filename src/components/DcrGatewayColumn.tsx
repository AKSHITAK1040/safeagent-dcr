import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LedgerEntry, SimulationPhase } from "@/types/dcr";
import {
  ShieldCheck,
  ShieldAlert,
  Database,
  ArrowDown,
  Search,
  CheckCircle,
  Zap,
  Lock,
  Layers,
  FileCheck2,
  AlertOctagon,
} from "lucide-react";

interface DcrGatewayColumnProps {
  gatewayEnabled: boolean;
  ledger: LedgerEntry[];
  simulationPhase: SimulationPhase;
  activeLookupRequest: string | null;
  interceptAlert: boolean;
}

export const DcrGatewayColumn: React.FC<DcrGatewayColumnProps> = ({
  gatewayEnabled,
  ledger,
  simulationPhase,
  activeLookupRequest,
  interceptAlert,
}) => {
  const isIntercepting =
    simulationPhase === "RETRY_GATEWAY_INTERCEPT" ||
    simulationPhase === "RETRY_RECEIPT_REPLAY" ||
    simulationPhase === "COMPLETE_RECOVERED";

  const isBypassing =
    simulationPhase === "RETRY_GATEWAY_BYPASS" ||
    simulationPhase === "RETRY_EXTERNAL_DUPLICATE" ||
    simulationPhase === "COMPLETE_DESYNCED";

  return (
    <div
      className={`flex flex-col h-full rounded-xl border transition-all duration-500 bg-[#0a0f1d] overflow-hidden shadow-2xl relative ${
        gatewayEnabled
          ? "border-cyan-500/50 shadow-[0_0_30px_rgba(0,240,255,0.15)] ring-1 ring-cyan-500/30"
          : "border-slate-800 shadow-xl"
      }`}
    >
      {/* Top subtle glow bar */}
      <div
        className={`h-1 w-full transition-all duration-300 ${
          gatewayEnabled
            ? "bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500 shadow-[0_0_10px_rgba(0,240,255,0.8)]"
            : "bg-slate-800"
        }`}
      />

      {/* Column Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-[#0e1628] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all duration-300 ${
              gatewayEnabled
                ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                : "bg-amber-950/40 border-amber-500/40 text-amber-400"
            }`}
          >
            {gatewayEnabled ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
              2. DCR Gateway
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  gatewayEnabled
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                    : "bg-amber-950 text-amber-300 border border-amber-500/40"
                }`}
              >
                {gatewayEnabled ? "ACTIVE" : "BYPASS"}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">Deterministic Middleware Interceptor</p>
          </div>
        </div>

        <div className="text-[11px] font-mono">
          <span
            className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
              gatewayEnabled
                ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300"
                : "border-slate-700 bg-slate-800/60 text-slate-400"
            }`}
          >
            {gatewayEnabled ? "IDEMPOTENT LEDGER" : "PASS-THROUGH"}
          </span>
        </div>
      </div>

      {/* STATE DRIFT DETECTED Flash Banner (when Gateway ON intercepts) */}
      <AnimatePresence>
        {isIntercepting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-cyan-500/60 bg-cyan-950/70 px-4 py-2.5 flex items-center gap-2 overflow-hidden text-cyan-200 font-mono text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            <AlertOctagon className="w-4 h-4 shrink-0 text-cyan-400 animate-pulse" />
            <div className="flex-1">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <span>STATE DRIFT DETECTED → DUPLICATE PREVENTED</span>
              </div>
              <p className="text-[10px] text-cyan-200/80">
                Found committed receipt for REQ-002. Intercepted mutation; returning stored receipt.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BYPASS WARNING Banner (when Gateway OFF fails to intercept) */}
      <AnimatePresence>
        {isBypassing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-rose-500/60 bg-rose-950/70 px-4 py-2.5 flex items-center gap-2 overflow-hidden text-rose-200 font-mono text-xs shadow-[0_0_20px_rgba(244,63,94,0.3)]"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
            <div className="flex-1">
              <div className="font-bold text-rose-300">
                GATEWAY BYPASSED: ZERO INTERCEPTION
              </div>
              <p className="text-[10px] text-rose-200/80">
                Execution ledger unchecked. Redundant request allowed straight into external SaaS!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Middle Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Ledger Section */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Execution Ledger
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {ledger.length} {ledger.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div className="mt-2 space-y-2">
            {ledger.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-slate-500 font-mono text-xs">
                Ledger empty. Awaiting agent transactions...
              </div>
            ) : (
              ledger.map((entry) => {
                const isMatching = activeLookupRequest === entry.requestId;
                return (
                  <motion.div
                    key={entry.requestId}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border p-2.5 font-mono text-xs transition-all duration-300 ${
                      isMatching && isIntercepting
                        ? "border-cyan-500 bg-cyan-950/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400"
                        : "border-slate-800 bg-[#0d1424]/80 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400">{entry.requestId}</span>
                      <span className="text-[10px] text-slate-500">{entry.committedAt}</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Action:</span>
                      <span className="text-slate-200 font-semibold">{entry.action}</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Receipt:</span>
                      <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
                        {entry.receiptId}
                      </span>
                    </div>

                    {isMatching && isIntercepting && (
                      <div className="mt-2 text-[10px] font-mono text-cyan-300 bg-cyan-950/90 p-1.5 rounded border border-cyan-500/40 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-cyan-400" />
                        <span>MATCH CONFIRMED: REPLAYING STORED RECEIPT</span>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Lookup Visual Flow Card */}
        <div className="rounded-lg border border-slate-800 bg-[#0d1424] p-3 font-mono text-xs space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            Deterministic Reconciliation Logic
          </div>

          <div className="space-y-1.5 pt-1 text-[11px]">
            {/* Step 1: Request Inbound */}
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Incoming:</span>
              <span className="text-cyan-300 font-bold">
                {activeLookupRequest ? `${activeLookupRequest} (Invoice)` : "Waiting for dispatch"}
              </span>
            </div>

            <div className="flex justify-center text-slate-600">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            {/* Step 2: Ledger Lookup */}
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Ledger Lookup:</span>
              <span
                className={`font-semibold ${
                  activeLookupRequest === "REQ-002"
                    ? "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                {activeLookupRequest === "REQ-002" ? "RECEIPT-72 Found" : "Ledger Query Pending"}
              </span>
            </div>

            <div className="flex justify-center text-slate-600">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            {/* Step 3: Decision */}
            <div
              className={`p-2 rounded border text-center font-bold text-[11px] transition-all duration-300 ${
                isIntercepting
                  ? "border-cyan-500 bg-cyan-950/60 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                  : isBypassing
                  ? "border-rose-500 bg-rose-950/50 text-rose-300"
                  : "border-slate-800 bg-slate-900/40 text-slate-500"
              }`}
            >
              {isIntercepting
                ? "INTERCEPT & REPLAY RECEIPT-72"
                : isBypassing
                ? "BYPASS: EXECUTE AGAIN (DUPLICATE)"
                : gatewayEnabled
                ? "IDEMPOTENT GATEWAY READY"
                : "BYPASS PASS-THROUGH READY"}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-[#080d17] text-[11px] font-mono text-slate-400">
        <div className="flex items-start gap-2">
          <FileCheck2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-300 font-semibold">Ledger Invariant:</span>
            <p className="text-slate-400 leading-tight mt-0.5">
              The external execution ledger holds committed receipts. When the gateway is ON, redundant operations are satisfied directly from verified receipts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
