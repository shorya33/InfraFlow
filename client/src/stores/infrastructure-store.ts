import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Node, Edge, InfrastructureData, NodeStatus } from "@shared/schema";
import { validateHierarchy } from "@/lib/hierarchy-validator";

interface InfrastructureStore {
  // State
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  nodeStatuses: Record<string, NodeStatus>;
  jsonExportModalOpen: boolean;
  searchQuery: string;
  highlightedNodeIds: string[];

  // Actions
  addNode: (type: Node["type"], position?: { x: number; y: number }, parentId?: string) => string;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, position: { x: number; y: number }, newParentId?: string) => boolean;

  addEdge: (sourceId: string, targetId: string) => boolean;
  deleteEdge: (id: string) => void;

  selectNode: (id: string | null) => void;
  setNodeStatus: (id: string, status: NodeStatus) => void;

  exportToJSON: () => InfrastructureData;
  importFromJSON: (data: InfrastructureData) => void;

  setJsonExportModalOpen: (open: boolean) => void;
  setSearchQuery: (query: string, highlightedIds: string[]) => void;
  focusNode: (nodeId: string) => void;

  // Added actions
  clearCanvas: () => void;
  setNodes: (nodes: Node[]) => void;

  // Helpers
  getSelectedNode: () => Node | null;
  getNodeChildren: (nodeId: string) => Node[];
  getNodeParent: (nodeId: string) => Node | null;
}

const createDefaultNodeData = (type: Node["type"], name?: string) => {
  const defaultName = name || type.replace("aws_", "").replace("_", " ");

  const baseData = { name: defaultName };

  switch (type) {
    case "aws_vpc":
      return {
        ...baseData,
        params: {
          cidr_block: "10.0.0.0/16",
          enable_dns_hostnames: true,
          enable_dns_support: true,
        },
      };
    case "aws_subnet":
      return {
        ...baseData,
        params: {
          subnet_type: "public",
          cidr_block: "10.0.1.0/24",
          availability_zone: "us-west-2a",
        },
      };
    case "aws_instance":
      return {
        ...baseData,
        params: {
          ami: "ami-0c02fb55956c7d316",
          instance_type: "t2.micro",
          key_name: "my-key-pair",
        },
      };
    case "aws_rds":
      return {
        ...baseData,
        params: {
          engine: "mysql",
          instance_class: "db.t3.micro",
          allocated_storage: 20,
        },
      };
    case "aws_elb":
      return {
        ...baseData,
        params: {
          load_balancer_type: "application",
          scheme: "internet-facing",
        },
      };
    case "aws_iam_role":
      return {
        ...baseData,
        params: {
          assume_role_policy: '{"Version":"2012-10-17","Statement":[]}',
        },
      };
    case "aws_s3_bucket":
      return {
        ...baseData,
        params: {
          bucket_name: `${defaultName.toLowerCase()}-${nanoid(8)}`,
          versioning: false,
        },
      };
    default:
      return baseData;
  }
};

export const useInfrastructureStore = create<InfrastructureStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      selectedNodeId: null,
      nodeStatuses: {},
      jsonExportModalOpen: false,
      searchQuery: "",
      highlightedNodeIds: [],

      // Node actions
      addNode: (type, position = { x: 0, y: 0 }, parentId) => {
        const id = nanoid();
        const newNode: Node = {
          id,
          type,
          parent: parentId || null,
          children: [],
          data: createDefaultNodeData(type),
          position,
        };

        set((state) => {
          const updatedNodes = [...state.nodes, newNode];

          // Update parent's children array if parentId provided
          if (parentId) {
            const parentIndex = updatedNodes.findIndex(n => n.id === parentId);
            if (parentIndex !== -1) {
              updatedNodes[parentIndex] = {
                ...updatedNodes[parentIndex],
                children: [...updatedNodes[parentIndex].children, id],
              };
            }
          }

          return {
            nodes: updatedNodes,
            nodeStatuses: { ...state.nodeStatuses, [id]: "not_applied" },
          };
        });

        return id;
      },

      updateNode: (id, updates) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, ...updates } : node
          ),
        }));
      },

      deleteNode: (id) => {
        set((state) => {
          const nodeToDelete = state.nodes.find(n => n.id === id);
          if (!nodeToDelete) return state;

          // Collect all descendant IDs
          const getDescendants = (nodeId: string): string[] => {
            const node = state.nodes.find(n => n.id === nodeId);
            if (!node) return [];

            const descendants = [...node.children];
            node.children.forEach(childId => {
              descendants.push(...getDescendants(childId));
            });
            return descendants;
          };

          const allToDelete = [id, ...getDescendants(id)];

          // Remove from parent's children array
          let updatedNodes = state.nodes.map(node => {
            if (node.children.includes(id)) {
              return {
                ...node,
                children: node.children.filter(childId => childId !== id),
              };
            }
            return node;
          });

          // Filter out deleted nodes
          updatedNodes = updatedNodes.filter(node => !allToDelete.includes(node.id));

          // Remove related edges
          const updatedEdges = state.edges.filter(
            edge => !allToDelete.includes(edge.source) && !allToDelete.includes(edge.target)
          );

          // Clean up statuses
          const updatedStatuses = { ...state.nodeStatuses };
          allToDelete.forEach(nodeId => {
            delete updatedStatuses[nodeId];
          });

          return {
            nodes: updatedNodes,
            edges: updatedEdges,
            nodeStatuses: updatedStatuses,
            selectedNodeId: allToDelete.includes(state.selectedNodeId || "") ? null : state.selectedNodeId,
          };
        });
      },

      moveNode: (id, position, newParentId) => {
        const state = get();
        const node = state.nodes.find(n => n.id === id);
        if (!node) return false;

        // Validate hierarchy if parentId is changing
        if (newParentId !== node.parent) {
          if (!validateHierarchy(node.type, newParentId || null, state.nodes)) {
            return false;
          }
        }

        set((state) => {
          let updatedNodes = [...state.nodes];

          // Remove from old parent
          if (node.parent) {
            const oldParentIndex = updatedNodes.findIndex(n => n.id === node.parent);
            if (oldParentIndex !== -1) {
              updatedNodes[oldParentIndex] = {
                ...updatedNodes[oldParentIndex],
                children: updatedNodes[oldParentIndex].children.filter(childId => childId !== id),
              };
            }
          }

          // Add to new parent
          if (newParentId) {
            const newParentIndex = updatedNodes.findIndex(n => n.id === newParentId);
            if (newParentIndex !== -1) {
              updatedNodes[newParentIndex] = {
                ...updatedNodes[newParentIndex],
                children: [...updatedNodes[newParentIndex].children, id],
              };
            }
          }

          // Update the node itself
          const nodeIndex = updatedNodes.findIndex(n => n.id === id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position,
              parent: newParentId || null,
            };
          }

          return { nodes: updatedNodes };
        });

        return true;
      },

      // Edge actions
      addEdge: (sourceId, targetId) => {
        const state = get();

        // Check if edge already exists
        const existingEdge = state.edges.find(
          edge => edge.source === sourceId && edge.target === targetId
        );
        if (existingEdge) return false;

        // Prevent self-loops
        if (sourceId === targetId) return false;

        // Check for cycles (simplified check)
        const wouldCreateCycle = (source: string, target: string): boolean => {
          const visited = new Set<string>();
          const dfs = (nodeId: string): boolean => {
            if (visited.has(nodeId)) return false;
            if (nodeId === source) return true;

            visited.add(nodeId);
            const outgoingEdges = state.edges.filter(e => e.source === nodeId);
            return outgoingEdges.some(e => dfs(e.target));
          };

          return dfs(target);
        };

        if (wouldCreateCycle(sourceId, targetId)) return false;

        const newEdge: Edge = {
          id: nanoid(),
          source: sourceId,
          target: targetId,
          type: "dependency",
        };

        set((state) => ({
          edges: [...state.edges, newEdge],
        }));

        return true;
      },

      deleteEdge: (id) => {
        set((state) => ({
          edges: state.edges.filter(edge => edge.id !== id),
        }));
      },

      // Selection
      selectNode: (id) => {
        set({ selectedNodeId: id });
      },

      setNodeStatus: (id, status) => {
        set((state) => ({
          nodeStatuses: { ...state.nodeStatuses, [id]: status },
        }));
      },

      // JSON operations
      exportToJSON: () => {
        const state = get();
        return {
          nodes: state.nodes,
          edges: state.edges,
        };
      },

      importFromJSON: (data) => {
        set({
          nodes: data.nodes,
          edges: data.edges,
          selectedNodeId: null,
          nodeStatuses: data.nodes.reduce((acc, node) => {
            acc[node.id] = "not_applied";
            return acc;
          }, {} as Record<string, NodeStatus>),
        });
      },

      setJsonExportModalOpen: (open) => {
        set({ jsonExportModalOpen: open });
      },

      setSearchQuery: (query, highlightedIds) => {
        set({ searchQuery: query, highlightedNodeIds: highlightedIds });
      },

      focusNode: (nodeId) => {
        set({ selectedNodeId: nodeId });
        // In a real implementation, this would also pan/zoom the canvas to the node
      },

      // Newly added methods
      clearCanvas: () => {
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
          searchQuery: "",
          highlightedNodeIds: []
        });
      },

      setNodes: (nodes: Node[]) => {
        set({ nodes });
      },


      // Helpers
      getSelectedNode: () => {
        const state = get();
        if (!state.selectedNodeId) return null;
        return state.nodes.find(node => node.id === state.selectedNodeId) || null;
      },

      getNodeChildren: (nodeId) => {
        const state = get();
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node) return [];
        return state.nodes.filter(n => node.children.includes(n.id));
      },

      getNodeParent: (nodeId) => {
        const state = get();
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node?.parent) return null;
        return state.nodes.find(n => n.id === node.parent) || null;
      },
    }),
    { name: "infrastructure-store" }
  )
);