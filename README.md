<div align="center">

# ☁️ CloudArchitect

### Visual Cloud Infrastructure Builder

Drag, drop, configure, and "deploy" cloud resources from a slick visual canvas.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React Flow](https://img.shields.io/badge/React%20Flow-11-FF0072)](https://reactflow.dev)
[![Zustand](https://img.shields.io/badge/Zustand-4-000000)](https://zustand-demo.pmnd.rs/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

</div>

---

## ✨ Overview

**CloudArchitect** is a frontend-driven MVP for visually designing cloud
infrastructure. Drop **EC2**, **Lambda**, and **S3** nodes onto a canvas,
connect them with edges, configure each resource through a modal, then
trigger a mock deployment that streams live logs into a terminal panel.

The project ships with two pages:

- `/` — marketing landing page with a hero **Start Designing** CTA
- `/build` — the visual infrastructure builder

All builder state is persisted to `localStorage` so your diagram survives a
page refresh.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Path Aliases](#-path-aliases)
- [Routing](#-routing)
- [State Management](#-state-management-zustand)
- [The Canvas](#-the-canvas-react-flow)
- [Nodes](#-nodes)
- [Edges](#-edges)
- [Drag and Drop Flow](#-drag-and-drop-flow)
- [Node Configuration Modal](#-node-configuration-modal)
- [Mock Deployment Engine](#-mock-deployment-engine)
- [Persistence](#-persistence)
- [Styling](#-styling)
- [Backend](#-backend)
- [License](#-license)

---

## 🚀 Features

- 🎨 **Drag & drop** cloud resources from a sidebar onto an infinite canvas
- 🔗 **Connect** resources with edges to model relationships
- 🧩 **Custom node UI** with service icons (🖥️ EC2, ⚡ Lambda, 🪣 S3)
- 🛠️ **Per-node configuration modal** with type-specific fields
- 🚀 **Mock deployment engine** with live, streaming logs
- 💾 **Persistent state** — refresh-safe via `localStorage`
- 🌗 **Dark-mode aware** styling with Tailwind + shadcn/ui

---

## 🧱 Tech Stack

| Layer       | Library                                          |
| ----------- | ------------------------------------------------ |
| UI          | React 18 + TypeScript                            |
| Bundler     | Vite                                             |
| Routing     | [`wouter`](https://github.com/molefrog/wouter)   |
| Canvas      | [`reactflow`](https://reactflow.dev)             |
| State       | [`zustand`](https://zustand-demo.pmnd.rs/) + `persist` middleware |
| Styling     | Tailwind CSS, shadcn/ui, Radix primitives        |
| Icons       | `lucide-react`                                   |
| Server      | Express (template default; not required by builder) |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **npm** (a `package-lock.json` is committed)

### 1. Install dependencies

```bash
npm install
```

> The two builder-specific packages, if you ever need to add them again:
> ```bash
> npm install reactflow zustand
> ```

### 2. Run the dev server

```bash
npm run dev
```

The app boots on **`http://localhost:5000`**:

| Route     | Description                                          |
| --------- | ---------------------------------------------------- |
| `/`       | Landing page — click **Start Designing** to enter the builder |
| `/build`  | Visual infrastructure builder                        |

### 3. Build for production

```bash
npm run build
npm start
```

---

## 📜 Available Scripts

| Script             | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `npm run dev`      | Start the Express + Vite dev server (port `5000`).     |
| `npm run build`    | Build the frontend and bundle the server to `dist/`.   |
| `npm start`        | Run the production build (`NODE_ENV=production`).      |
| `npm run check`    | TypeScript type-check the entire project.              |
| `npm run db:push`  | Push the Drizzle schema (only if a DB is wired).       |

---

## 🗂️ Project Structure

```text
.
├── client/                            # React frontend
│   ├── index.html
│   └── src/
│       ├── main.tsx                   # React entrypoint
│       ├── App.tsx                    # Wouter router + global providers
│       ├── index.css                  # Tailwind layers + design tokens
│       │
│       ├── pages/
│       │   ├── Home.tsx               # Landing page (composes marketing sections)
│       │   ├── Build.tsx              # /build — canvas, sidebar, top bar, logs
│       │   └── not-found.tsx
│       │
│       ├── components/
│       │   ├── Navbar.tsx             # Marketing nav
│       │   ├── Hero.tsx               # Hero with the "Start Designing" CTA
│       │   ├── Features.tsx
│       │   ├── HowItWorks.tsx
│       │   ├── ArchitecturePreview.tsx
│       │   ├── CtaSection.tsx
│       │   ├── Footer.tsx
│       │   ├── CustomNode.tsx         # Builder: custom React Flow node renderer
│       │   ├── NodeConfigModal.tsx    # Builder: per-node configuration modal
│       │   └── ui/                    # shadcn/ui primitives
│       │
│       ├── lib/
│       │   ├── infraStore.ts          # Zustand store (nodes, edges, modal, logs)
│       │   ├── deploy.ts              # Mock deployment engine
│       │   ├── queryClient.ts         # TanStack Query client (template)
│       │   └── utils.ts
│       │
│       └── hooks/
│           ├── use-toast.ts
│           └── use-mobile.tsx
│
├── server/                            # Express backend (template default)
│   ├── index.ts                       # Server entry
│   ├── routes.ts                      # API routes (none required by builder)
│   ├── storage.ts                     # IStorage interface (in-memory)
│   └── vite.ts                        # Vite middleware integration
│
├── shared/
│   └── schema.ts                      # Shared Drizzle/Zod schemas (template)
│
├── tailwind.config.ts
├── vite.config.ts
├── drizzle.config.ts
├── package.json
└── README.md
```

---

## 🔗 Path Aliases

Configured in `vite.config.ts`:

| Alias        | Resolves to          |
| ------------ | -------------------- |
| `@/*`        | `client/src/*`       |
| `@assets/*`  | `attached_assets/*`  |
| `@shared/*`  | `shared/*`           |

---

## 🧭 Routing

Routing uses [`wouter`](https://github.com/molefrog/wouter). Routes are
registered in `client/src/App.tsx`:

```tsx
<Switch>
  <Route path="/" component={Home} />
  <Route path="/build" component={Build} />
  <Route component={NotFound} />
</Switch>
```

Internal navigation uses `<Link href="...">` from `wouter` — see the
**Start Designing** button in `Hero.tsx` and the **Back** button in
`Build.tsx`.

---

## 🧠 State Management (Zustand)

All builder state lives in a **single Zustand store**:
[`client/src/lib/infraStore.ts`](client/src/lib/infraStore.ts).

> The store is the **single source of truth** — React Flow does not keep its
> own copy. Modal updates, drag-to-move, deployment, and persistence all stay
> perfectly in sync.

### Store shape

```ts
type InfraStore = {
  // Graph data
  nodes: Node[];                 // React Flow nodes
  edges: Edge[];                 // React Flow edges

  // UI / interaction
  selectedNode: Node | null;     // Drives the configuration modal

  // Mock deployment
  logs: string[];
  isDeploying: boolean;

  // Mutators
  setNodes:        (nodes: Node[]) => void;
  setEdges:        (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;
  updateNode:      (id: string, newData: Record<string, any>) => void;
  setLogs:         (logs: string[]) => void;
  addLog:          (log: string) => void;
  setDeploying:    (val: boolean) => void;
};
```

### Persistence middleware

```ts
persist(creator, {
  name: "infra-storage",
  partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
});
```

- **What is persisted:** `nodes` and `edges` only
- **What is NOT persisted:** `selectedNode`, `logs`, `isDeploying` — so a
  refresh boots a clean UI with the diagram intact

### `updateNode` reducer

Used by the configuration modal. Merges new field values into the node's
`data` and updates the visible `label` whenever a `name` is supplied:

```ts
updateNode: (id, newData) =>
  set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id
        ? {
            ...node,
            data: {
              ...node.data,
              ...newData,
              label: newData.name || node.data.label,
            },
          }
        : node
    ),
  }));
```

---

## 🖼️ The Canvas (React Flow)

The canvas lives in [`client/src/pages/Build.tsx`](client/src/pages/Build.tsx).
The page is split into three regions:

```text
┌────────┬──────────────────────────────────┐
│        │  Top bar (Back · title · Clear · │
│  Side  │   Generate Infra · Deploy)       │
│  bar   ├──────────────────────────────────┤
│ (200px)│                                  │
│        │          React Flow canvas       │
│ EC2    │                                  │
│ Lambda │                                  │
│ S3     ├──────────────────────────────────┤
│        │  Black terminal logs panel (h-40)│
└────────┴──────────────────────────────────┘
```

### Wiring React Flow to Zustand

Because the store owns the graph, `nodes` and `edges` props are read directly
from the store, and changes are applied with React Flow's helpers:

```ts
const onNodesChange = (changes) =>
  setNodes(applyNodeChanges(changes, useInfraStore.getState().nodes));

const onEdgesChange = (changes) =>
  setEdges(applyEdgeChanges(changes, useInfraStore.getState().edges));

const onConnect = (params) =>
  setEdges(addEdge(params, useInfraStore.getState().edges));
```

> Reading state via `useInfraStore.getState()` inside callbacks guarantees the
> latest snapshot, which is critical for rapid drag/connect operations.

### Provider & built-in UI

The canvas is wrapped in `<ReactFlowProvider>` so children can use hooks like
`useReactFlow()` (we use `screenToFlowPosition` for accurate drop positions).
React Flow's `<Background />`, `<Controls />`, and a pannable / zoomable
`<MiniMap />` are mounted inside `<ReactFlow>`.

---

## 🧩 Nodes

### Custom node component

Every dropped resource is rendered with the **custom node** in
[`client/src/components/CustomNode.tsx`](client/src/components/CustomNode.tsx):

- Shows the resource type (e.g. `EC2`) as a small uppercase header
- Shows the configured `label` (defaults to the resource type, replaced by
  the user-provided `name` after Save)
- Shows a service icon at the **bottom-left**:

  | Type      | Icon |
  | --------- | ---- |
  | `ec2`     | 🖥️   |
  | `lambda`  | ⚡   |
  | `s3`      | 🪣   |
  | _other_   | 📦   |

- Renders React Flow `<Handle>`s on **top** (`target`) and **bottom**
  (`source`) so edges can be drawn between nodes

Registered with React Flow:

```ts
const nodeTypes = { custom: CustomNode };
<ReactFlow nodeTypes={nodeTypes} ... />
```

### Node `data` shape

```ts
{
  label: string;     // What renders on the node
  type: string;      // "ec2" | "lambda" | "s3" — drives icon and modal
  name?: string;     // User-supplied name (also becomes label after Save)

  // EC2:
  instanceType?: "t2.micro" | "t3.small";

  // Lambda:
  runtime?: "nodejs" | "python";
  memory?: number;   // MB

  // S3:
  isPublic?: boolean;
}
```

### Creating a node (inside `onDrop`)

```ts
const newNode: Node = {
  id: crypto.randomUUID(),
  type: "custom",                          // matches the nodeTypes key
  position,                                 // from screenToFlowPosition
  data: { label: type, type: type.toLowerCase(), name: "" },
};
setNodes([...useInfraStore.getState().nodes, newNode]);
```

---

## 🪢 Edges

Edges are standard React Flow edges. They are created when the user drags
from one node's bottom handle to another node's top handle. The connection
callback adds the edge to the store via `addEdge`:

```ts
const onConnect = (params) =>
  setEdges(addEdge(params, useInfraStore.getState().edges));
```

Edges are persisted to `localStorage` alongside nodes.

---

## 🖱️ Drag and Drop Flow

The drag-and-drop pipeline has three pieces:

### 1. Sidebar items set the payload

```ts
event.dataTransfer.setData("application/reactflow", nodeType);
event.dataTransfer.effectAllowed = "move";
```

### 2. `onDragOver` on the canvas wrapper

```ts
event.preventDefault();
event.dataTransfer.dropEffect = "move";
```

### 3. `onDrop` on the canvas wrapper

```ts
event.preventDefault();
const type = event.dataTransfer.getData("application/reactflow");
const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
setNodes([...useInfraStore.getState().nodes, newNode]);
```

> `screenToFlowPosition` (from `useReactFlow`) accounts for current pan and
> zoom, so the node lands exactly under the cursor regardless of viewport
> state.

---

## 🛠️ Node Configuration Modal

File: [`client/src/components/NodeConfigModal.tsx`](client/src/components/NodeConfigModal.tsx).

### Opening

`Build.tsx` passes `onNodeClick` to React Flow:

```ts
onNodeClick={(_, node) => {
  const fresh = useInfraStore.getState().nodes.find((n) => n.id === node.id) || node;
  setSelectedNode(fresh);
}}
```

### Rendering

The modal renders only when `selectedNode` is non-null. It is a controlled
overlay (`fixed inset-0` with a backdrop) and its form fields adapt to the
node's `data.type`:

| Type      | Fields                                                       |
| --------- | ------------------------------------------------------------ |
| **EC2**   | `name`, `instanceType` (`t2.micro` / `t3.small`)             |
| **Lambda**| `name`, `runtime` (`nodejs` / `python`), `memory` (MB)       |
| **S3**    | `name`, `isPublic` (checkbox)                                |

### Saving

`Save` calls `updateNode(selectedNode.id, payload)` on the store, then closes
the modal. Because the canvas reads `nodes` directly from the store, the
node's label updates instantly.

`Cancel`, the close button, and clicking the backdrop all dispatch
`setSelectedNode(null)`.

---

## 🚀 Mock Deployment Engine

File: [`client/src/lib/deploy.ts`](client/src/lib/deploy.ts).

The **Deploy** button calls `deployInfra()`, which:

1. Aborts if a deployment is already in flight
2. Resets the log panel and flips `isDeploying` to `true`
3. Logs `🔍 Validating infrastructure...` and waits 1s
4. Iterates through every node in the store:

   | Type      | Logs                                                           |
   | --------- | -------------------------------------------------------------- |
   | **EC2**   | `🚀 Launching ...` → wait 1.5s → `✅ EC2 deployed: <id>`        |
   | **Lambda**| `⚡ Creating ...`  → wait 1.2s → `✅ Lambda deployed: <id>`     |
   | **S3**    | `🪣 Creating ...`  → wait 1.0s → `✅ S3 created: <id>`          |

5. Logs `🎉 Deployment completed successfully!` and flips `isDeploying`
   back to `false`

A `delay(ms)` helper wraps `setTimeout` in a Promise so the loop is awaited
without blocking the UI.

The **logs panel** at the bottom of `/build` reads `logs` from the store and
auto-scrolls to the newest line via a `useEffect` on a ref:

```tsx
useEffect(() => {
  if (logsRef.current) {
    logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }
}, [logs]);
```

> The **Generate Infra** button is a developer-friendly companion that prints
> the current `{ nodes, edges }` JSON to the browser console.

---

## 💾 Persistence

| Aspect           | Detail                                                 |
| ---------------- | ------------------------------------------------------ |
| **Persisted**    | `nodes`, `edges`                                       |
| **Not persisted**| `selectedNode`, `logs`, `isDeploying`                  |
| **Storage**      | `localStorage` under the key `infra-storage`           |
| **Reset**        | Click **Clear** in the top bar, or remove the key from DevTools |

---

## 🎨 Styling

- Tailwind CSS with design tokens defined in `client/src/index.css`
  (`H S% L%` color variables, no `hsl()` wrapper — see `tailwind.config.ts`).
- shadcn/ui primitives live under `client/src/components/ui/`.
- Icons from [`lucide-react`](https://lucide.dev/).
- Dark mode is toggled via the `.dark` class on the document root.

---

## 🗄️ Backend

The Express backend in `server/` is the project template's default. The
visual builder itself is **fully frontend** — there are no API calls, no
authentication, and no database writes required. The backend is kept around
for future expansion (e.g. saving diagrams server-side, calling a real cloud
provider SDK from `routes.ts`).

If you do not need it, you can ignore everything under `server/` —
`npm run dev` will still serve the frontend correctly.

---

## 📄 License

Released under the [MIT License](https://opensource.org/licenses/MIT).

---

<div align="center">

Built with ☁️ + ⚡ on **Replit**

</div>
