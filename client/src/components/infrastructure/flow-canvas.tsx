import { useCallback, useRef, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node as FlowNode,
  ReactFlowProvider,
  OnConnect,
  OnNodesDelete,
  OnEdgesDelete,
  NodeDragHandler,
  SelectionMode,
  useReactFlow,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus, Minus, Maximize, Trash2, LayoutGrid, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInfrastructureStore } from "@/stores/infrastructure-store";
import { getNodeTypes } from "@/lib/node-types";
import DependencyEdge from "./edges/dependency-edge";

const edgeTypes = {
  dependency: DependencyEdge,
};

// Enhanced edge options for better routing
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { strokeWidth: 2 },
  pathOptions: { offset: 10, borderRadius: 10 },
};

const nodeTypes = getNodeTypes();

function FlowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [minimapVisible, setMinimapVisible] = useState(true);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  const {
    nodes: storeNodes,
    edges: storeEdges,
    addEdge: addStoreEdge,
    deleteNode,
    deleteEdge,
    selectNode,
    moveNode,
    highlightedNodeIds,
    searchQuery,
    selectedNodeId,
  } = useInfrastructureStore();

  // Convert store nodes to ReactFlow nodes
  const reactFlowNodes = useMemo(() => {
    return storeNodes.map((node) => {
      const isHighlighted = highlightedNodeIds.includes(node.id);
      const isDimmed = searchQuery && !isHighlighted;
      
      return {
        id: node.id,
        type: node.type,
        position: node.position || { x: 0, y: 0 },
        data: {
          ...node.data,
          nodeId: node.id,
          nodeType: node.type,
          parent: node.parent,
          children: node.children,
          isHighlighted,
          isDimmed,
        },
        parentNode: node.parent || undefined,
        extent: node.parent ? 'parent' : undefined,
        draggable: true,
        style: isDimmed ? { opacity: 0.3 } : isHighlighted ? { opacity: 1, filter: 'brightness(1.1)' } : {},
      } as FlowNode;
    });
  }, [storeNodes, highlightedNodeIds, searchQuery]);

  // Convert store edges to ReactFlow edges
  const reactFlowEdges = useMemo(() => {
    return storeEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "dependency",
      animated: true,
      data: edge,
    }));
  }, [storeEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Sync with store
  useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const success = addStoreEdge(connection.source, connection.target);
        if (!success) {
          console.warn("Failed to create edge - invalid connection");
        }
      }
    },
    [addStoreEdge]
  );

  const onNodesDelete: OnNodesDelete = useCallback(
    (deletedNodes) => {
      deletedNodes.forEach((node) => {
        deleteNode(node.id);
      });
    },
    [deleteNode]
  );

  const onEdgesDelete: OnEdgesDelete = useCallback(
    (deletedEdges) => {
      deletedEdges.forEach((edge) => {
        deleteEdge(edge.id);
      });
    },
    [deleteEdge]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: FlowNode) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (_event: any, node: any) => {
      moveNode(node.id, node.position);
    },
    [moveNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const { addNode } = useInfrastructureStore.getState();
      addNode(type as any, position);
    },
    [reactFlowInstance]
  );

  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.1 });
    }
  }, [reactFlowInstance]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  }, [selectedNodeId, deleteNode]);

  const handleClearCanvas = useCallback(() => {
    const { clearCanvas } = useInfrastructureStore.getState();
    clearCanvas();
  }, []);

  const handleAutoLayout = useCallback(() => {
    // Basic auto-layout implementation
    if (reactFlowInstance) {
      const { nodes } = useInfrastructureStore.getState();
      const updatedNodes = nodes.map((node, index) => ({
        ...node,
        position: {
          x: (index % 4) * 250,
          y: Math.floor(index / 4) * 200,
        },
      }));
      
      const { setNodes } = useInfrastructureStore.getState();
      setNodes(updatedNodes);
    }
  }, [reactFlowInstance]);

  const toggleMinimap = useCallback(() => {
    setMinimapVisible(!minimapVisible);
  }, [minimapVisible]);


  return (
    <div 
      className="w-full h-full relative" 
      ref={reactFlowWrapper}
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{ width: '100%', height: '100%' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={["Delete", "Backspace"]}
        className="bg-background"
        data-testid="flow-canvas"
        snapToGrid={true}
        snapGrid={[20, 20]}
        connectionLineType="smoothstep"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background 
          color="hsl(214.3 31.8% 91.4%)" 
          gap={20} 
          size={1}
          className="canvas-bg"
        />
        
        <Controls 
          className="bg-card border border-border rounded-lg shadow-sm"
          showZoom={false}
          showFitView={false}
          showInteractive={false}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={handleZoomIn}
            data-testid="button-zoom-in"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={handleZoomOut}
            data-testid="button-zoom-out"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={handleFitView}
            data-testid="button-fit-view"
            title="Fit View"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </Controls>

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="bg-card border border-border rounded-lg p-2 shadow-sm flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={handleDeleteSelected}
              disabled={!selectedNodeId}
              data-testid="button-delete-selected"
              title="Delete Selected"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={handleAutoLayout}
              data-testid="button-auto-layout"
              title="Auto Layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={toggleMinimap}
              data-testid="button-toggle-minimap"
              title="Toggle Minimap"
            >
              {minimapVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {minimapVisible && (
          <MiniMap 
            className="bg-card border border-border rounded-lg"
            nodeColor={(node) => {
              if (node.type === 'vpc') return '#22c55e';
              if (node.type === 'subnet') return node.data.params?.subnet_type === 'public' ? '#22c55e' : '#3b82f6';
              return '#64748b';
            }}
            maskColor="rgba(240, 242, 247, 0.6)"
            data-testid="minimap"
            pannable
            zoomable
            position="bottom-right"
          />
        )}
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
