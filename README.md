<div align="center">

# ☁️ CloudArchitect

### Visual Cloud Infrastructure Builder (with IAM + Smart Connections)

Drag, drop, configure, connect, and simulate cloud infrastructure visually.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React Flow](https://img.shields.io/badge/React%20Flow-11-FF0072)](https://reactflow.dev)
[![Zustand](https://img.shields.io/badge/Zustand-4-000000)](https://zustand-demo.pmnd.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

</div>

---

## ✨ Overview

**CloudArchitect** is a frontend-driven MVP for designing cloud infrastructure on a visual canvas with IAM role management and smart connections.

You can now:

- Design architectures using EC2, Lambda, S3
- Connect resources with **real-world relationships**
- Assign **IAM roles via connections**
- Simulate deployments with logs

---

## 🚀 Features

### 🎨 Core Builder
- Drag & drop cloud resources
- Infinite canvas using React Flow
- Custom nodes with icons
- Persistent state via localStorage

---

### 🔗 Smart Connections (NEW)

Connections are no longer just lines — they represent **real infrastructure relationships**.

#### ✅ Supported Connections

| From   | To     | Allowed |
|--------|--------|---------|
| Lambda | S3     | ✅      |
| EC2    | S3     | ✅      |
| S3     | Lambda | ✅      |
| Others |        | ❌      |

---

### 🧠 Edge Configuration Modal (NEW)

When connecting nodes, a modal opens automatically.

You can configure:

- **Relation**
  - `read`
  - `write`
  - `both`
  - `trigger`

- **Role**
  - Select existing role
  - OR create new role

---

### 🔐 IAM Role System (NEW)

#### Role Selection

```text
Select Role:
  existing-role-1
  existing-role-2
  ➕ Create New Role
```

#### Create New Role

- Enter role name
- Select permission:
  - Read
  - Write
  - Read + Write

---

### ⚡ Connection → IAM Mapping

Connections automatically generate IAM policies:

| Connection          | IAM Policy Generated |
|---------------------|----------------------|
| Lambda → S3 (read)  | `s3:GetObject`       |
| Lambda → S3 (write) | `s3:PutObject`       |
| Lambda → S3 (both)  | Both                 |

---

### 🏗️ Node Role Model

Each node now contains:

```json
{
  "role": {
    "name": "lambda-s3-role",
    "policies": [
      {
        "Action": ["s3:GetObject"],
        "Resource": "*"
      }
    ]
  }
}
```

---

### 🪢 Edge Data Model (UPDATED)

Edges now store metadata:

```json
{
  "source": "lambda-node",
  "target": "s3-node",
  "label": "read (lambda-role)",
  "data": {
    "relation": "read",
    "role": "lambda-role"
  }
}
```

---

### 🧠 State Management (Zustand)

Store now includes:

```ts
selectedEdge: Connection | Edge | null;
setSelectedEdge: (edge) => void;
```

#### Additional helpers:

- `setNodeRole(nodeId, roleName)`
- `addPolicyToNode(nodeId, policy)`
- `addEdgeWithData(edge)`

---

### 🔍 Debugging (Important)

Zustand updates are async.

❌ Wrong:
```ts
console.log(nodes);
```

✅ Correct:
```ts
const updated = useInfraStore.getState().nodes;
console.log(updated);
```

---

### 🚀 Deployment Engine

Mock deployment with logs:

```text
🔍 Validating infrastructure...
🚀 Launching EC2...
⚡ Creating Lambda...
🪣 Creating S3...
🎉 Deployment completed!
```

---

## 🧱 Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| UI          | React 18 + TypeScript                          |
| Bundler     | Vite                                           |
| Canvas      | React Flow                                     |
| State       | Zustand (with persist middleware)              |
| Styling     | Tailwind CSS + shadcn/ui                       |
| Icons       | lucide-react                                   |
| Server      | Express (optional)                             |
| Database    | PostgreSQL + Drizzle ORM                       |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **npm**
- **PostgreSQL** (for database)

### 1. Set up the database

Create a `.env` file in the project root with your database URL:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/cloudcanvas
```

Or copy from the example:
```bash
cp .env.example .env
```

Then ensure PostgreSQL is running and push the schema:

```bash
npm run db:push
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

Use the provided run script:

```bash
# Linux/Mac
./run.sh

# Windows
run.bat
```

Or manually:

```bash
npm run dev
```

The app boots on **`http://localhost:5000`**:

| Route     | Description                                          |
| --------- | ---------------------------------------------------- |
| `/`       | Landing page — click **Start Designing** to enter the builder |
| `/build`  | Visual infrastructure builder                        |

### 4. Build for production

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
| `npm run db:push`  | Push the Drizzle schema to the database.               |
| `./run.sh`         | Run setup script (Linux/Mac).                          |
| `run.bat`          | Run setup script (Windows).                            |

---

## 📂 Project Structure

```text
.
├── client/                            # React frontend
│   ├── index.html
│   └── src/
│       ├── main.tsx                   # React entrypoint
│       ├── App.tsx                    # Wouter router
│       ├── index.css                  # Tailwind + design tokens
│       ├── pages/
│       │   ├── Home.tsx               # Landing page
│       │   ├── Build.tsx              # Infrastructure builder
│       │   └── not-found.tsx
│       ├── components/
│       │   ├── CustomNode.tsx         # Node UI with icons
│       │   ├── NodeConfigModal.tsx    # Node configuration
│       │   ├── EdgeConfigModal.tsx    # Edge configuration (NEW)
│       │   ├── Navbar.tsx
│       │   ├── Hero.tsx
│       │   ├── Features.tsx
│       │   ├── ArchitecturePreview.tsx
│       │   └── ui/                    # shadcn/ui components
│       ├── lib/
│       │   ├── infraStore.ts          # Zustand store (UPDATED)
│       │   ├── deploy.ts              # Mock deployment engine
│       │   ├── utils.ts
│       │   └── queryClient.ts
│       └── hooks/
│           ├── use-toast.ts
│           └── use-mobile.tsx
├── server/                            # Express backend
│   ├── index.ts                       # Server entrypoint
│   ├── db.ts                          # Database connection
│   ├── routes.ts                      # API routes
│   ├── static.ts                      # Static file serving
│   └── storage.ts
├── shared/                            # Shared types & schema
│   ├── schema.ts                      # Drizzle schema
│   └── routes.ts
├── script/
│   └── build.ts                       # Build script
├── .env.example                       # Environment template
├── run.sh                             # Linux/Mac startup script
├── run.bat                            # Windows startup script
├── drizzle.config.ts                  # Drizzle configuration
├── tailwind.config.ts                 # Tailwind configuration
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 🧠 Architecture (NEW)

```text
Node → Resource (EC2, Lambda, S3)
Edge → Relationship + IAM Policy
Role → Assigned to source node
Policy → Derived from relation type
```

---

## 🔮 Future Roadmap

- ✅ IAM modeling (done)
- ✅ Smart connections (done)
- ⏳ Terraform generation
- ⏳ AWS CLI export
- ⏳ CloudFormation support
- ⏳ VPC / Subnet modeling
- ⏳ Multi-account architecture

---

## 📄 License

MIT License

---

## 🔥 What you've achieved

This is no longer just a UI builder.

You've built:
- 🎯 A **visual IAM designer**
- 🔗 A **graph-based infrastructure engine**
- 📐 A **foundation for Terraform/CloudFormation generation**

**Next step recommendation:** Generate Terraform from nodes + edges to make this a seriously portfolio-level DevOps tool.
