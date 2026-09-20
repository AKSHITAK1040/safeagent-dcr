import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationPhase, PacketVisual } from "@/types/dcr";
import {
  BrainCircuit,
  ShieldCheck,
  ShieldAlert,
  Server,
  ArrowRight,
  ArrowLeft,
  Zap,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

interface PacketBusVisualizerProps {
  currentPacket: PacketVisual | null;
  simulationPhase: SimulationPhase;
  gatewayEnabled: boolean;
}

export const PacketBusVisualizer: React.FC<PacketBusVisualizerProps> = ({
  currentPacket,
  simulationPhase,
  gatewayEnabled,
}) => {
  // Compute visual track position of the packet based on phase
  const getPacketPosition = () => {
    switch (simulationPhase) {
      case "STEP_1_SENDING":
      case "STEP_2_SENDING":
      case "STEP_3_SENDING":
      case "RETRY_SENDING":
        return 22; // In flight between Agent & Gateway

      case "STEP_1_GATEWAY":
      case "STEP_2_GATEWAY":
      case "STEP_3_GATEWAY":
      case "RETRY_GATEWAY_INTERCEPT":
      case "RETRY_GATEWAY_BYPASS":
        return 50; // At Gateway

      case "STEP_1_EXTERNAL":
      case "STEP_2_EXTERNAL":
      case "RETRY_EXTERNAL_DUPLICATE":
        return 78; // In flight between Gateway & External API

      case "STEP_1_COMMITTED":
      case "STEP_2_COMMITTED":
        return 92; // At External API

      case "STEP_3_TIMEOUT":
        return 85; // Timeout drop point near API

      case "RETRY_RECEIPT_REPLAY":
        return 25; // Replaying receipt from Gateway back to Agent

      default:
        return null;
    }
  };

  const packetPos = getPacketPosition();
  const isReturning = simulationPhase === "RETRY_RECEIPT_REPLAY";
  const isTimeout = simulationPhase === "STEP_3_TIMEOUT";
  const isIntercept =
    simulationPhase === "RETRY_GATEWAY_INTERCEPT" || simulationPhase === "RETRY_RECEIPT_REPLAY";
  const isDupe =
    simulationPhase === "RETRY_GATEWAY_BYPASS" || simulationPhase === "RETRY_EXTERNAL_DUPLICATE";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-2">
      <div className="relative rounded-xl border border-slate-800/90 bg-[#080d17]/90 px-4 py-3 shadow-lg overflow-hidden">
        {/* Track Nodes Label Row */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 relative z-10">
          {/* Node 1: Agent */}
          <div className="flex items-center gap-1.5 w-1/3">
            <div className="w-5 h-5 rounded bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <BrainCircuit className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-300">Agent Memory</span>
          </div>

          {/* Node 2: Gateway */}
          <div className="flex items-center justify-center gap-1.5 w-1/3">
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                gatewayEnabled
                  ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-400"
                  : "bg-amber-950/60 border-amber-500/50 text-amber-400"
              }`}
            >
              {gatewayEnabled ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
            </div>
            <span className="font-bold text-slate-200">
              DCR Gateway {gatewayEnabled ? "(ARMED)" : "(BYPASS)"}
            </span>
          </div>

          {/* Node 3: External API */}
          <div className="flex items-center justify-end gap-1.5 w-1/3">
            <span className="font-bold text-slate-300">External SaaS API</span>
            <div className="w-5 h-5 rounded bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Server className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Bus Connecting Wire */}
        <div className="relative my-3.5 h-1.5 w-full bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
          {/* Left segment (Agent -> Gateway) */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1/2 transition-colors duration-300 ${
              isReturning
                ? "bg-gradient-to-l from-cyan-500 to-purple-500 shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                : packetPos !== null && packetPos <= 50
                ? "bg-cyan-500/40"
                : "bg-slate-800/40"
            }`}
          />

          {/* Right segment (Gateway -> External API) */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-1/2 transition-colors duration-300 ${
              isDupe
                ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                : isIntercept
                ? "bg-slate-800/30 border-l-2 border-cyan-500" // Blocked visual barrier!
                : packetPos !== null && packetPos > 50
                ? "bg-emerald-500/40"
                : "bg-slate-800/40"
            }`}
          />

          {/* Blocking shield barrier when Gateway is ON and intercepts */}
          {isIntercept && (
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,1)] z-20">
              <span className="w-2 h-2 bg-slate-950 rounded-full" />
            </div>
          )}
        </div>

        {/* Animated Packet */}
        <div className="relative h-7">
          <AnimatePresence>
            {packetPos !== null && currentPacket && (
              <motion.div
                key={`${currentPacket.id}-${simulationPhase}`}
                initial={{ left: isReturning ? "50%" : "5%", opacity: 0, scale: 0.8 }}
                animate={{
                  left: `${packetPos}%`,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 18,
                }}
                className={`absolute -translate-x-1/2 top-0 px-2.5 py-1 rounded-md border font-mono text-[11px] font-bold shadow-xl flex items-center gap-1.5 z-30 transition-all ${
                  isReturning
                    ? "border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.6)]"
                    : isTimeout
                    ? "border-amber-400 bg-amber-950 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-bounce"
                    : isDupe
                    ? "border-rose-500 bg-rose-950 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                    : isIntercept
                    ? "border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.6)]"
                    : "border-sky-400 bg-sky-950 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                }`}
              >
                {isReturning ? (
                  <>
                    <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                    <FileCheck2 className="w-3 h-3 text-cyan-400" />
                    <span>Replaying {currentPacket.receiptId || "RECEIPT-72"} → Agent</span>
                  </>
                ) : isTimeout ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>NETWORK TIMEOUT (504 Drop)</span>
                  </>
                ) : isIntercept ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>GATEWAY INTERCEPT: {currentPacket.requestId}</span>
                  </>
                ) : isDupe ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                    <span>BYPASS: {currentPacket.requestId} → DUPLICATE</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      {currentPacket.requestId}: {currentPacket.action}
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle message when no packet is in transit */}
          {packetPos === null && (
            <div className="text-center font-mono text-[11px] text-slate-400 pt-1">
              {simulationPhase === "COMPLETE_RECOVERED" ? (
                <span className="text-cyan-400 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  RECOVERED — 1 duplicate execution prevented (Receipt INV-102 replayed)
                </span>
              ) : simulationPhase === "COMPLETE_DESYNCED" ? (
                <span className="text-rose-400 font-bold flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  DESYNCED: Redundant invoice INV-102 executed twice in external SaaS.
                </span>
              ) : (
                <span>Bus quiescent. Click 'Simulate Failure &amp; Rollback' to fire pipeline.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
