# SafeAgent-DCR

> **Preventing duplicate external actions when AI agent state rolls back.**

An interactive, single-screen technical proof-of-concept demonstrating **Deterministic Checkpoint Reconciliation (DCR)**. A deterministic middleware gateway sitting between an AI agent and external SaaS APIs (Stripe, billing, notifications) that detects rollback state drift and idempotently prevents duplicate mutations.

---

## ⚡ Live Architecture

```text
  Agent Memory                  DCR Gateway                 External SaaS API
┌──────────────┐          ┌─────────────────────┐      ┌─────────────────────────┐
│ Checkpoint 1 │          │  Execution Ledger   │      │ Terminal Event Stream   │
│ Checkpoint 2 │ -------> │  REQ-001 → RCPT-71  │ ---> │ 09:42:11 POST /customer │
│ Checkpoint 3 │          │  REQ-002 → RCPT-72  │      │ 09:42:12 POST /invoice  │
└──────────────┘          └─────────────────────┘      │ 09:42:13 POST /notify 504
       ▲                             │                 └─────────────────────────┘
       │      Replayed RECEIPT-72    │                               │
       └─────────────────────────────┴─────────[ INTERCEPTED ]───────┘
```

## 🛠️ The Technical Message

> **AI memory is not the source of truth. The external execution ledger is.**
> When an autonomous agent encounters an upstream or downstream failure and rolls back its working context to an earlier checkpoint, it risks blindly executing redundant mutations against external systems. The DCR gateway intercepts retried requests, verifies committed receipts in the ledger, and satisfies the retry idempotently without re-executing against third-party APIs.

---

## 🚀 Key Features

* **Three-Column Distributed Debugger**:
  * **Left — Agent Memory**: Vertical checkpoint timeline with status badges (`PENDING`, `ACTIVE`, `COMMITTED`, `ROLLED_BACK`). Animates backward (`CP3 → CP1`) when Step 3 encounters a simulated 504 timeout.
  * **Center — DCR Gateway**: Middleware node with live Execution Ledger, deterministic lookup flow, and intercept alert banner.
  * **Right — External SaaS API**: Immutable event stream terminal and real-time remote database record state.
* **Framer Motion Packet Bus**: Real-time visualization of data packets moving across nodes, timeout flash, rollback, and intercepted receipt replay.
* **Three Live Metrics**:
  * `Transactions Prevented` (0 vs 1 duplicate blocked)
  * `Memory Drift Delta` (`Agent checkpoint step - verified external commit step`, e.g. `2 - 3 = -1`)
  * `Execution State` (`SYNCHRONIZED`, `RUNNING`, `FAILED`, `ROLLED_BACK`, `DESYNCED`, `RECOVERED`)

---

## 📦 Tech Stack

* **Framework**: Next.js 15 (App Router)
* **Library**: React 19
* **Styling**: Tailwind CSS
* **Animation**: Framer Motion
* **Icons**: Lucide React
* **Effects**: Canvas Confetti
* **Deployment**: Vercel Ready (Optimized static export)

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/AKSHITAK1040/safeagent-dcr.git
cd safeagent-dcr

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deploying to Vercel

### Deploy via GitHub
1. Push to GitHub (`git push origin main`)
2. Import repo in [Vercel Dashboard](https://vercel.com/new)
3. Framework Preset: **Next.js**
4. Deploy!

### Deploy via Vercel CLI
```bash
npx vercel
# or production deploy:
npx vercel --prod
```
