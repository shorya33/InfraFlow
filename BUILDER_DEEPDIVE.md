# 🧠 How the Builder Works (Deep Dive)

This section explains **how nodes and edges are created, managed, and updated** inside the CloudArchitect builder.

---

## 🔄 High-Level Flow

```text
User Action
   ↓
Drag Node / Connect Edge
   ↓
React Flow Event (onDrop / onConnect)
   ↓
Zustand Store Update (nodes / edges)
   ↓
UI Re-renders from Store
   ↓
Right Sidebar edits selected element (Node / Edge)
   ↓
Store Updates → Ready for Deployment JSON
```

---

## 🖱️ 1. Drag & Drop → Node Creation

### 📍 Where it happens

`Build.tsx`

### 🔹 Flow

```text
Sidebar Drag → onDrop → create Node → store.setNodes()
```

### 🔹 Code

```ts
const onDrop = (event: DragEvent) => {
  event.preventDefault();

  const type = event.dataTransfer.getData("application/reactflow");

  const position = screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  const newNode: Node = {
    id: crypto.randomUUID(),
    type: "custom",
    position,
    data: {
      label: type,
      type: type.toLowerCase(),
      name: "",
      role: { name: "", policies: [] },
      triggers: [],
    },
  };

  setNodes([...useInfraStore.getState().nodes, newNode]);
};
```

---

## 🔗 2. Connecting Nodes → Edge Creation (UPDATED)

### 📍 Where it happens

`Build.tsx`

### 🔹 Flow

```text
User connects nodes
   ↓
onConnect (Connection object - NO id)
   ↓
Store selectedElement = edge (temporary)
   ↓
Right Sidebar opens (EdgeConfigPanel)
   ↓
User selects relation + role
   ↓
Final Edge is created using addEdgeWithData()
```

---

### 🔹 Code (IMPORTANT CHANGE)

```ts
const onConnect = (params: Connection) => {
  setSelectedElement({ type: "edge", data: params });
};
```

---

## ⚠️ Connection vs Edge (CRITICAL)

```text
Connection = temporary (no id)
Edge       = final (must have id)
```

```ts
type Connection = {
  source: string | null;
  target: string | null;
}
```

👉 You **must convert Connection → Edge manually**

---

## 🧩 3. Edge Creation (Final)

Edges are created **ONLY after user config from Right Sidebar**

```ts
addEdgeWithData({
  id: crypto.randomUUID(),   // ✅ REQUIRED
  source: selected.source!,
  target: selected.target!,
  label: relation,
  data: {
    relation,
    role,
  },
});
```

---

## 🧠 4. Zustand State Management (UPDATED)

### 📍 File

`infraStore.ts`

---

### 🔹 Store Structure

```ts
type SelectedElement =
  | { type: "node"; data: Node }
  | { type: "edge"; data: Edge | Connection }
  | null;

type InfraStore = {
  nodes: Node[];
  edges: Edge[];

  selectedElement: SelectedElement;

  logs: string[];
  isDeploying: boolean;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedElement: (el: SelectedElement) => void;

  updateNode: (id: string, data: any) => void;

  addEdgeWithData: (edge: Edge) => void;

  setNodeRole: (nodeId: string, roleName: string) => void;
  addPolicyToNode: (nodeId: string, policy: any) => void;
  addTriggerToNode: (nodeId: string, trigger: any) => void;
};
```

---

## 🧩 5. Node Selection

```ts
onNodeClick={(_, node) => {
  setSelectedElement({ type: "node", data: node });
}}
```

---

## 🔗 6. Edge Selection

```ts
onEdgeClick={(_, edge) => {
  setSelectedElement({ type: "edge", data: edge });
}}
```

---

## 🧾 7. Right Sidebar (Single Control Panel - UPDATED)

### 📍 Component

`RightSidebar.tsx`

---

### 🔹 Behavior

```text
No selection → show placeholder
Node selected → show NodeConfigPanel
Edge selected → show EdgeConfigPanel
```

---

### 🔹 Code

```tsx
if (!selectedElement) {
  return <div>Select a node or connection</div>;
}

return (
  <>
    {selectedElement.type === "node" && (
      <NodeConfigPanel node={selectedElement.data} />
    )}

    {selectedElement.type === "edge" && (
      <EdgeConfigPanel edge={selectedElement.data as Edge} />
    )}
  </>
);
```

---

## 🛠️ 8. Edge Editing Logic (NEW)

### 📍 File

`EdgeConfigPanel.tsx`

---

### 🔹 State Sync (IMPORTANT)

```ts
useEffect(() => {
  if (!selectedElement || selectedElement.type !== "edge") return;

  const selected = selectedElement.data;

  if ("id" in selected && selected.data) {
    // EXISTING EDGE
    setRelation(selected.data.relation || "read");
    setRole(selected.data.role || "");
  } else {
    // NEW EDGE
    setRelation("read");
    setRole("");
  }
}, [selectedElement]);
```

---

### 🔹 Save Logic (FIXED FOR ZUSTAND)

```ts
const handleSave = () => {
  setEdges(
    useInfraStore.getState().edges.map((e) =>
      e.id === edge.id
        ? {
            ...e,
            label: relation,
            data: {
              ...e.data,
              relation,
              role,
            },
          }
        : e
    )
  );
};
```

---

## ⚠️ Zustand Gotcha (IMPORTANT)

❌ WRONG:

```ts
setEdges((edges) => ...)
```

✅ CORRECT:

```ts
setEdges(newEdgesArray)
```

---

## 🧠 9. Data Manipulation (Core Logic)

### 🔹 Update Node

```ts
updateNode(id, newData)
```

---

### 🔹 Add IAM Role

```ts
setNodeRole(nodeId, roleName)
```

---

### 🔹 Add IAM Policy

```ts
addPolicyToNode(nodeId, {
  Action: ["s3:GetObject"],
  Resource: "*",
});
```

---

### 🔹 Add Trigger

```ts
addTriggerToNode(nodeId, {
  type: "s3",
  bucket: "my-bucket",
});
```

---

## 🔐 10. AWS Logic Mapping (Important)

### Example: Lambda → S3

```text
Connection:
Lambda ──(read/write)──▶ S3

Result:
✔ IAM Role attached to Lambda
✔ Policy added:
   - s3:GetObject
   - s3:PutObject
✔ Edge stores relation + role
```

---

## 📦 11. Data Shape (Final)

### Node

```json
{
  "id": "node-1",
  "type": "custom",
  "data": {
    "type": "lambda",
    "name": "processImage",
    "role": {
      "name": "lambda-s3-role",
      "policies": [
        {
          "Action": ["s3:GetObject"],
          "Resource": "*"
        }
      ]
    },
    "triggers": []
  }
}
```

---

### Edge

```json
{
  "id": "edge-1",
  "source": "lambda-1",
  "target": "s3-1",
  "label": "read",
  "data": {
    "relation": "read",
    "role": "lambda-s3-role"
  }
}
```

---

## 🧠 12. Mental Model (UPDATED)

```text
Nodes = Resources (EC2, Lambda, S3)

Edges = Relationships
       (access, trigger, permissions)

Connection = Temporary (no id)
Edge       = Final (has id)

Zustand = Single Source of Truth

Right Sidebar = Control Panel (replaces modals)
```

---

## 🚀 13. Why This Design Works

* ✅ No modals → cleaner UX
* ✅ Centralized control (Right Sidebar)
* ✅ Explicit edge creation (better for AWS logic)
* ✅ Easy to map → IAM / CloudFormation
* ✅ Fully extensible

---

## 🔮 Next Evolution

* IAM auto-generation from edges
* VPC → Subnet → EC2 hierarchy
* Security Groups as edges
* Export → CloudFormation JSON
* Python validation using boto3
* Multi-account infra support

---

## 📌 Next Recommended Steps

**Option 1: CloudFormation Generator** (⭐ Recommended)
- Convert nodes + edges → valid CloudFormation JSON
- This is where your MVP becomes a real DevOps tool
- Users can deploy directly to AWS

**Option 2: VPC Hierarchy**
- Add parent-child relationships (VPC → Subnet → EC2)
- This will 10x your app's value for enterprise users
- More complex but higher impact

Choose based on your goals! 👍
