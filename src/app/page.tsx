"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Header } from "@/components/Header";
import { MetricsBar } from "@/components/MetricsBar";
import { Controls } from "@/components/Controls";
import { AgentMemoryColumn } from "@/components/AgentMemoryColumn";
import { DcrGatewayColumn } from "@/components/DcrGatewayColumn";
import { ExternalApiColumn } from "@/components/ExternalApiColumn";
import { PacketBusVisualizer } from "@/components/PacketBusVisualizer";
import { ArchitectureModal } from "@/components/ArchitectureModal";
import {
  ExecutionState,
  SimulationPhase,
  LedgerEntry,
  AgentCheckpoint,
  ExternalApiLogEntry,
  ExternalRecord,
  PacketVisual,
} from "@/types/dcr";
import { ShieldCheck, ShieldAlert, Sparkles, Terminal, ArrowRight, Layers } from "lucide-react";

const INITIAL_CHECKPOINTS: AgentCheckpoint[] = [
  {
    id: 1,
    stepNumber: 1,
    name: "Checkpoint 1: Customer",
    action: "Create Customer",
    payload: { name: "Acme Corp", tier: "Enterprise", region: "us-east-1" },
    timestamp: "09:42:11",
    status: "PENDING",
    summary: "Register customer record in billing core",
  },
  {
    id: 2,
    stepNumber: 2,
    name: "Checkpoint 2: Invoice",
    action: "Create Invoice",
    payload: { invoiceId: "INV-102", amount: "$4,250.00", currency: "USD" },
    timestamp: "09:42:12",
    status: "PENDING",
    summary: "Generate net-30 tax invoice INV-102",
  },
  {
    id: 3,
    stepNumber: 3,
    name: "Checkpoint 3: Notification",
    action: "Send Notification",
    payload: { target: "billing@acme.com", channel: "webhook" },
    timestamp: "09:42:13",
    status: "PENDING",
    summary: "Dispatch webhook notice to customer endpoint",
  },
];

export default function SafeAgentDcrPage() {
  // Config & Flags
  const [gatewayEnabled, setGatewayEnabled] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Simulation State
  const [executionState, setExecutionState] = useState<ExecutionState>("SYNCHRONIZED");
  const [simulationPhase, setSimulationPhase] = useState<SimulationPhase>("IDLE");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Metrics
  const [transactionsPrevented, setTransactionsPrevented] = useState<number>(0);
  const [agentCheckpointStep, setAgentCheckpointStep] = useState<number>(1);
  const [externalCommitStep, setExternalCommitStep] = useState<number>(1);

  // Column States
  const [checkpoints, setCheckpoints] = useState<AgentCheckpoint[]>(INITIAL_CHECKPOINTS);
  const [activeCheckpointId, setActiveCheckpointId] = useState<number>(0);
  const [isRollingBack, setIsRollingBack] = useState<boolean>(false);

  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [activeLookupRequest, setActiveLookupRequest] = useState<string | null>(null);
  const [interceptAlert, setInterceptAlert] = useState<boolean>(false);

  const [externalLogs, setExternalLogs] = useState<ExternalApiLogEntry[]>([]);
  const [externalRecords, setExternalRecords] = useState<ExternalRecord[]>([]);

  const [currentPacket, setCurrentPacket] = useState<PacketVisual | null>(null);

  // Ref to cancel ongoing timeouts if reset
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  // Reset function
  const handleReset = () => {
    clearAllTimeouts();
    setIsRunning(false);
    setExecutionState("SYNCHRONIZED");
    setSimulationPhase("IDLE");
    setTransactionsPrevented(0);
    setAgentCheckpointStep(1);
    setExternalCommitStep(1);
    setCheckpoints(INITIAL_CHECKPOINTS);
    setActiveCheckpointId(0);
    setIsRollingBack(false);
    setLedger([]);
    setActiveLookupRequest(null);
    setInterceptAlert(false);
    setExternalLogs([]);
    setExternalRecords([]);
    setCurrentPacket(null);
  };

  // Run Simulation
  const handleStartSimulation = () => {
    if (isRunning) return;
    clearAllTimeouts();
    handleReset();

    setIsRunning(true);
    setExecutionState("RUNNING");

    const baseDelay = 1100 / playbackSpeed;
    let accumulatedTime = 100;

    const schedule = (fn: () => void, delayMs: number) => {
      accumulatedTime += delayMs;
      const t = setTimeout(fn, accumulatedTime);
      timeoutsRef.current.push(t);
    };

    // --- STEP 1: CREATE CUSTOMER ---
    // 1. Agent dispatches REQ-001
    schedule(() => {
      setSimulationPhase("STEP_1_SENDING");
      setActiveCheckpointId(1);
      setCheckpoints((prev) =>
        prev.map((c) => (c.id === 1 ? { ...c, status: "ACTIVE" } : c))
      );
      setCurrentPacket({
        id: "pkt-1",
        requestId: "REQ-001",
        action: "POST /customer",
        from: "agent",
        to: "gateway",
        status: "normal",
        active: true,
      });
    }, baseDelay);

    // 2. REQ-001 at Gateway
    schedule(() => {
      setSimulationPhase("STEP_1_GATEWAY");
      setActiveLookupRequest("REQ-001");
      setCurrentPacket((prev) =>
        prev ? { ...prev, from: "gateway", to: "external" } : null
      );
    }, baseDelay * 0.8);

    // 3. REQ-001 reaches External API
    schedule(() => {
      setSimulationPhase("STEP_1_EXTERNAL");
      setExternalLogs((prev) => [
        ...prev,
        {
          id: "log-1",
          time: "09:42:11",
          method: "POST",
          endpoint: "/customer",
          status: 200,
          receiptId: "RECEIPT-71",
          notes: "Customer Acme Corp registered",
        },
      ]);
      setExternalRecords((prev) => [
        ...prev,
        {
          id: "rec-1",
          type: "Customer",
          identifier: "Acme Corp (CUST-881)",
          receiptId: "RECEIPT-71",
          createdAt: "09:42:11",
        },
      ]);
      setLedger((prev) => [
        ...prev,
        {
          requestId: "REQ-001",
          action: "POST /customer",
          receiptId: "RECEIPT-71",
          committedAt: "09:42:11",
          payloadSummary: "Acme Corp (Enterprise)",
          hash: "0x8f2a4",
          status: "COMMITTED",
        },
      ]);
    }, baseDelay * 0.8);

    // 4. Step 1 Committed
    schedule(() => {
      setSimulationPhase("STEP_1_COMMITTED");
      setCheckpoints((prev) =>
        prev.map((c) => (c.id === 1 ? { ...c, status: "COMMITTED" } : c))
      );
      setAgentCheckpointStep(1);
      setExternalCommitStep(1);
      setActiveLookupRequest(null);
      setCurrentPacket(null);
    }, baseDelay * 0.6);

    // --- STEP 2: CREATE INVOICE ---
    // 1. Agent dispatches REQ-002
    schedule(() => {
      setSimulationPhase("STEP_2_SENDING");
      setActiveCheckpointId(2);
      setCheckpoints((prev) =>
        prev.map((c) => (c.id === 2 ? { ...c, status: "ACTIVE" } : c))
      );
      setCurrentPacket({
        id: "pkt-2",
        requestId: "REQ-002",
        action: "POST /invoice",
        from: "agent",
        to: "gateway",
        status: "normal",
        active: true,
      });
    }, baseDelay * 0.8);

    // 2. REQ-002 at Gateway
    schedule(() => {
      setSimulationPhase("STEP_2_GATEWAY");
      setActiveLookupRequest("REQ-002");
      setCurrentPacket((prev) =>
        prev ? { ...prev, from: "gateway", to: "external" } : null
      );
    }, baseDelay * 0.8);

    // 3. REQ-002 reaches External API
    schedule(() => {
      setSimulationPhase("STEP_2_EXTERNAL");
      setExternalLogs((prev) => [
        ...prev,
        {
          id: "log-2",
          time: "09:42:12",
          method: "POST",
          endpoint: "/invoice",
          status: 200,
          receiptId: "RECEIPT-72",
          notes: "Invoice INV-102 created for $4,250",
        },
      ]);
      setExternalRecords((prev) => [
        ...prev,
        {
          id: "rec-2",
          type: "Invoice",
          identifier: "Invoice INV-102 ($4,250)",
          receiptId: "RECEIPT-72",
          createdAt: "09:42:12",
        },
      ]);
      setLedger((prev) => [
        ...prev,
        {
          requestId: "REQ-002",
          action: "POST /invoice",
          receiptId: "RECEIPT-72",
          committedAt: "09:42:12",
          payloadSummary: "INV-102 ($4,250)",
          hash: "0x3e8b1",
          status: "COMMITTED",
        },
      ]);
    }, baseDelay * 0.8);

    // 4. Step 2 Committed
    schedule(() => {
      setSimulationPhase("STEP_2_COMMITTED");
      setCheckpoints((prev) =>
        prev.map((c) => (c.id === 2 ? { ...c, status: "COMMITTED" } : c))
      );
      setAgentCheckpointStep(2);
      setExternalCommitStep(2);
      setActiveLookupRequest(null);
      setCurrentPacket(null);
    }, baseDelay * 0.6);

    // --- STEP 3: SEND NOTIFICATION (INJECTED TIMEOUT) ---
    // 1. Agent dispatches REQ-003
    schedule(() => {
      setSimulationPhase("STEP_3_SENDING");
      setActiveCheckpointId(3);
      setCheckpoints((prev) =>
        prev.map((c) => (c.id === 3 ? { ...c, status: "ACTIVE" } : c))
      );
      setCurrentPacket({
        id: "pkt-3",
        requestId: "REQ-003",
        action: "POST /notify",
        from: "agent",
        to: "gateway",
        status: "normal",
        active: true,
      });
    }, baseDelay * 0.8);

    // 2. Gateway routes to API
    schedule(() => {
      setSimulationPhase("STEP_3_GATEWAY");
      setCurrentPacket((prev) =>
        prev ? { ...prev, from: "gateway", to: "external" } : null
      );
    }, baseDelay * 0.6);

    // 3. NETWORK TIMEOUT OCCURS!
    schedule(() => {
      setSimulationPhase("STEP_3_TIMEOUT");
      setExecutionState("FAILED");
      setCheckpoints((prev) =>
        prev.map((c) => (c.id === 3 ? { ...c, status: "FAILED" } : c))
      );
      setExternalLogs((prev) => [
        ...prev,
        {
          id: "log-3",
          time: "09:42:13",
          method: "POST",
          endpoint: "/notify",
          status: "TIMEOUT",
          notes: "Injected network timeout (504 Gateway Timeout)",
        },
      ]);
      setCurrentPacket({
        id: "pkt-3-err",
        requestId: "REQ-003",
        action: "POST /notify",
        from: "external",
        to: "agent",
        status: "error",
        active: true,
      });
    }, baseDelay * 0.9);

    // --- AGENT ROLLBACK: CHECKPOINT 3 -> CHECKPOINT 1 ---
    schedule(() => {
      setSimulationPhase("ROLLBACK_ANIMATING");
      setIsRollingBack(true);
      setCurrentPacket(null);
      // Rewind timeline backward: Evict Checkpoint 2 and 3
      setCheckpoints((prev) =>
        prev.map((c) =>
          c.id === 2 || c.id === 3
            ? { ...c, status: "ROLLED_BACK" }
            : { ...c, status: "COMMITTED" }
        )
      );
      setActiveCheckpointId(1);
      setAgentCheckpointStep(1);
      // External commit is still at 2!
      setExternalCommitStep(2);
    }, baseDelay * 1.3);

    // Agent now in rolled-back state
    schedule(() => {
      setSimulationPhase("ROLLED_BACK_STATE");
      setExecutionState("ROLLED_BACK");
      setIsRollingBack(false);
    }, baseDelay * 0.9);

    // --- RETRY STEP 2: AGENT RETRIES INVOICE ---
    schedule(() => {
      setSimulationPhase("RETRY_PREPARING");
      // Agent sets memory to step 2 again
      setActiveCheckpointId(2);
      setCheckpoints((prev) =>
        prev.map((c) => (c.id === 2 ? { ...c, status: "ACTIVE" } : c))
      );
      setAgentCheckpointStep(2);
    }, baseDelay * 0.8);

    // Dispatching retry request REQ-002
    schedule(() => {
      setSimulationPhase("RETRY_SENDING");
      setCurrentPacket({
        id: "pkt-retry",
        requestId: "REQ-002",
        action: "POST /invoice (RETRY)",
        from: "agent",
        to: "gateway",
        status: "normal",
        active: true,
      });
      setActiveLookupRequest("REQ-002");
    }, baseDelay * 0.8);

    // --- BRANCH: GATEWAY OFF vs GATEWAY ON ---
    if (!gatewayEnabled) {
      // ===== GATEWAY OFF: BYPASS -> DUPLICATE MUTATION =====
      schedule(() => {
        setSimulationPhase("RETRY_GATEWAY_BYPASS");
        // Packet passes directly through gateway!
        setCurrentPacket({
          id: "pkt-retry-bypass",
          requestId: "REQ-002",
          action: "POST /invoice (UNCHECKED)",
          from: "gateway",
          to: "external",
          status: "normal",
          active: true,
        });
      }, baseDelay * 0.9);

      // External SaaS executes duplicate!
      schedule(() => {
        setSimulationPhase("RETRY_EXTERNAL_DUPLICATE");
        setExecutionState("DESYNCED");
        setExternalCommitStep(3); // Now 3 external commits (1 customer + 2 invoices!)
        setTransactionsPrevented(0);

        setExternalLogs((prev) => [
          ...prev,
          {
            id: "log-4-dupe",
            time: "09:42:14",
            method: "POST",
            endpoint: "/invoice",
            status: 200,
            receiptId: "RECEIPT-73",
            isDuplicate: true,
            notes: "⚠️ DUPLICATE INVOICE CREATED! (Customer double billed)",
          },
        ]);

        setExternalRecords((prev) => [
          ...prev,
          {
            id: "rec-3-dupe",
            type: "Invoice",
            identifier: "Invoice INV-102 DUPLICATE ($4,250)",
            receiptId: "RECEIPT-73",
            createdAt: "09:42:14",
            isDuplicate: true,
          },
        ]);

        setCheckpoints((prev) =>
          prev.map((c) => (c.id === 2 ? { ...c, status: "COMMITTED" } : c))
        );
      }, baseDelay * 1.1);

      // Completion of Gateway OFF run
      schedule(() => {
        setSimulationPhase("COMPLETE_DESYNCED");
        setIsRunning(false);
        setCurrentPacket(null);
      }, baseDelay * 0.8);
    } else {
      // ===== GATEWAY ON: DCR INTERCEPT -> REPLAY RECEIPT =====
      schedule(() => {
        setSimulationPhase("RETRY_GATEWAY_INTERCEPT");
        setInterceptAlert(true);
        // Gateway detects previous execution in ledger!
        setCurrentPacket({
          id: "pkt-intercept",
          requestId: "REQ-002",
          action: "INTERCEPTED",
          from: "gateway",
          to: "agent",
          status: "intercepted",
          receiptId: "RECEIPT-72",
          active: true,
        });
      }, baseDelay * 0.9);

      // Replaying stored receipt back to Agent
      schedule(() => {
        setSimulationPhase("RETRY_RECEIPT_REPLAY");
        setExecutionState("RECOVERED");
        setTransactionsPrevented(1);
        setExternalCommitStep(2); // Still exactly 2 commits (Customer + single Invoice)

        setExternalLogs((prev) => [
          ...prev,
          {
            id: "log-4-intercept",
            time: "09:42:14",
            method: "POST",
            endpoint: "/invoice",
            status: "BLOCKED",
            receiptId: "RECEIPT-72",
            isIntercepted: true,
            notes: "INTERCEPTED: RECEIPT-72 replayed to Agent. 0 requests sent to external API.",
          },
        ]);

        // Agent marks step 2 restored using the replayed receipt
        setCheckpoints((prev) =>
          prev.map((c) => (c.id === 2 ? { ...c, status: "COMMITTED" } : c))
        );

        // Confetti celebrate deterministic recovery!
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#00f0ff", "#10b981", "#38bdf8"],
          });
        } catch {
          // ignore in SSR
        }
      }, baseDelay * 1.1);

      // Completion of Gateway ON run
      schedule(() => {
        setSimulationPhase("COMPLETE_RECOVERED");
        setIsRunning(false);
        setCurrentPacket(null);
      }, baseDelay * 0.8);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-200">
      {/* 1. Header with Badges & Navigation */}
      <Header
        gatewayEnabled={gatewayEnabled}
        onOpenDocs={() => setIsDocsOpen(true)}
        onReset={handleReset}
        isRunning={isRunning}
      />

      {/* 2. Top Live Metrics Bar */}
      <MetricsBar
        executionState={executionState}
        transactionsPrevented={transactionsPrevented}
        agentCheckpointStep={agentCheckpointStep}
        externalCommitStep={externalCommitStep}
        gatewayEnabled={gatewayEnabled}
      />

      {/* 3. Controls & Phase Banner */}
      <Controls
        gatewayEnabled={gatewayEnabled}
        onToggleGateway={(enabled) => {
          setGatewayEnabled(enabled);
          handleReset();
        }}
        onStartSimulation={handleStartSimulation}
        onReset={handleReset}
        isRunning={isRunning}
        simulationPhase={simulationPhase}
        playbackSpeed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
      />

      {/* 4. Animated Packet Bus across the 3 nodes */}
      <PacketBusVisualizer
        currentPacket={currentPacket}
        simulationPhase={simulationPhase}
        gatewayEnabled={gatewayEnabled}
      />

      {/* 5. Main 3-Column Technical Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-[520px]">
          {/* Column 1: Agent Memory */}
          <AgentMemoryColumn
            checkpoints={checkpoints}
            activeCheckpointId={activeCheckpointId}
            isRollingBack={isRollingBack}
            simulationPhase={simulationPhase}
          />

          {/* Column 2: DCR Gateway */}
          <DcrGatewayColumn
            gatewayEnabled={gatewayEnabled}
            ledger={ledger}
            simulationPhase={simulationPhase}
            activeLookupRequest={activeLookupRequest}
            interceptAlert={interceptAlert}
          />

          {/* Column 3: External SaaS API */}
          <ExternalApiColumn
            logs={externalLogs}
            records={externalRecords}
            simulationPhase={simulationPhase}
            gatewayEnabled={gatewayEnabled}
          />
        </div>
      </main>

      {/* 6. Technical Message Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070b13] px-4 py-3 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              <strong className="text-white">AI memory is not the source of truth.</strong> The external execution
              ledger is.
            </span>
          </div>

          <div className="text-slate-400 text-[11px]">
            The DCR gateway reconciles agent checkpoints before allowing retries.
          </div>
        </div>
      </footer>

      {/* Architecture Deep Dive Modal */}
      <ArchitectureModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
