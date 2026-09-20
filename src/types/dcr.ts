export type ExecutionState =
  | "SYNCHRONIZED"
  | "IDLE"
  | "RUNNING"
  | "FAILED"
  | "ROLLED_BACK"
  | "DESYNCED"
  | "RECOVERED";

export type SimulationPhase =
  | "IDLE"
  | "STEP_1_SENDING"
  | "STEP_1_GATEWAY"
  | "STEP_1_EXTERNAL"
  | "STEP_1_COMMITTED"
  | "STEP_2_SENDING"
  | "STEP_2_GATEWAY"
  | "STEP_2_EXTERNAL"
  | "STEP_2_COMMITTED"
  | "STEP_3_SENDING"
  | "STEP_3_GATEWAY"
  | "STEP_3_TIMEOUT"
  | "ROLLBACK_ANIMATING"
  | "ROLLED_BACK_STATE"
  | "RETRY_PREPARING"
  | "RETRY_SENDING"
  | "RETRY_GATEWAY_INTERCEPT"
  | "RETRY_GATEWAY_BYPASS"
  | "RETRY_EXTERNAL_DUPLICATE"
  | "RETRY_RECEIPT_REPLAY"
  | "COMPLETE_DESYNCED"
  | "COMPLETE_RECOVERED";

export interface LedgerEntry {
  requestId: string;
  action: string;
  receiptId: string;
  committedAt: string;
  payloadSummary: string;
  hash: string;
  status: "COMMITTED" | "REPLAYED" | "BYPASSED";
}

export interface AgentCheckpoint {
  id: number;
  stepNumber: number;
  name: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: string;
  status: "PENDING" | "ACTIVE" | "COMMITTED" | "ROLLED_BACK" | "RESTORED" | "FAILED";
  summary: string;
}

export interface ExternalApiLogEntry {
  id: string;
  time: string;
  method: "POST" | "GET";
  endpoint: string;
  status: number | "TIMEOUT" | "BLOCKED";
  receiptId?: string;
  isDuplicate?: boolean;
  isIntercepted?: boolean;
  notes?: string;
}

export interface ExternalRecord {
  id: string;
  type: "Customer" | "Invoice" | "Notification";
  identifier: string;
  receiptId: string;
  createdAt: string;
  isDuplicate?: boolean;
}

export interface PacketVisual {
  id: string;
  requestId: string;
  action: string;
  from: "agent" | "gateway" | "external";
  to: "agent" | "gateway" | "external";
  status: "normal" | "error" | "intercepted" | "receipt";
  receiptId?: string;
  active: boolean;
}
