import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Database, BrainCircuit, Server, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/40 bg-[#0a0f1d] p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)] font-sans text-slate-200"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 font-mono text-cyan-400 text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              Technical Architecture Whitepaper
            </div>
            <h2 className="text-2xl font-bold font-mono text-white mt-1">
              SafeAgent-DCR: Deterministic Checkpoint Reconciliation
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Preventing duplicate external side effects when autonomous AI agent state rewinds.
            </p>
          </div>

          {/* Core Technical Invariant Banner */}
          <div className="my-5 p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/30 font-mono text-sm">
            <span className="text-cyan-400 font-bold block mb-1">THE SYSTEM INVARIANT:</span>
            <p className="text-slate-200">
              <strong className="text-white">AI memory is not the source of truth.</strong> The external execution
              ledger is. The DCR gateway reconciles the two before allowing any retry mutation.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-4">
              <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-3">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h3 className="font-mono font-bold text-white text-sm">1. Agent Context Volatility</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                When an agent encounters a tool error or network timeout at Step 3, popular frameworks (LangGraph,
                CrewAI, AutoGen) roll back internal scratchpads to a previous checkpoint (e.g. Checkpoint 1).
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-4">
              <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-mono font-bold text-white text-sm">2. The Phantom Mutation Flaw</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Step 2 (Invoice Creation) already succeeded on Stripe before the failure. Because the agent rolled back,
                it does not remember it already created the invoice, and naively issues a duplicate HTTP POST.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-mono font-bold text-white text-sm">3. Deterministic Intercept</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                The DCR gateway intercepts the retried request, looks up the hash/requestId in the external ledger,
                detects state drift, and re-serves the committed receipt without hitting the remote API.
              </p>
            </div>
          </div>

          {/* Flowchart Diagram */}
          <div className="rounded-xl border border-slate-800 bg-[#060a12] p-4 font-mono text-xs text-slate-300">
            <div className="font-bold text-slate-400 mb-2 uppercase text-[11px]">Lifecycle Comparison</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Without DCR */}
              <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-950/20">
                <div className="text-rose-400 font-bold mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  GATEWAY OFF (Bypass Mode)
                </div>
                <div className="space-y-1 text-slate-400 text-[11px]">
                  <div>1. Step 1 & 2 succeed in remote SaaS</div>
                  <div>2. Step 3 times out</div>
                  <div>3. Agent rolls back Checkpoint 3 → 1</div>
                  <div>4. Agent retries Step 2 (POST /invoice)</div>
                  <div className="text-rose-400 font-bold">5. Remote SaaS creates DUPLICATE invoice INV-102!</div>
                </div>
              </div>

              {/* With DCR */}
              <div className="p-3 rounded-lg border border-cyan-500/40 bg-cyan-950/20">
                <div className="text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  GATEWAY ON (DCR Active)
                </div>
                <div className="space-y-1 text-slate-400 text-[11px]">
                  <div>1. Step 1 & 2 succeed and commit to Ledger</div>
                  <div>2. Step 3 times out</div>
                  <div>3. Agent rolls back Checkpoint 3 → 1</div>
                  <div>4. Agent retries Step 2 (POST /invoice)</div>
                  <div className="text-cyan-400 font-bold">5. Gateway detects match → Replays RECEIPT-72!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              Back to Live Simulation
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
