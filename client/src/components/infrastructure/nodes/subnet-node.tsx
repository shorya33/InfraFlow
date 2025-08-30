import { memo, useCallback } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import { Layers } from "lucide-react";
import { getAwsIcon } from "@/components/icons/aws-icons";
import { useInfrastructureStore } from "@/stores/infrastructure-store";

interface SubnetNodeProps {
  data: {
    nodeId: string;
    name: string;
    params?: {
      subnet_type?: "public" | "private";
      cidr_block?: string;
    };
    isHighlighted?: boolean;
    isDimmed?: boolean;
  };
  selected: boolean;
}

function SubnetNode({ data, selected }: SubnetNodeProps) {
  const isPublic = data.params?.subnet_type === "public";
  const borderColor = isPublic ? "border-green-500" : "border-blue-500";
  const bgColor = isPublic ? "bg-green-50/50 dark:bg-green-950/10" : "bg-blue-50/50 dark:bg-blue-950/10";
  const headerColor = isPublic ? "text-green-600" : "text-blue-600";
  const dropZoneColor = isPublic ? "border-green-300/40 text-green-600/40" : "border-blue-300/40 text-blue-600/40";
  const highlightClass = data.isHighlighted ? 'ring-2 ring-yellow-400 border-yellow-400' : '';
  const awsIcon = getAwsIcon("aws_subnet", "w-4 h-4");

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const nodeType = event.dataTransfer.getData('application/reactflow');
    if (nodeType) {
      const { addNode } = useInfrastructureStore.getState();
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left - 50,
        y: event.clientY - rect.top - 25,
      };
      addNode(nodeType as any, position, data.nodeId);
    }
  }, [data.nodeId]);

  return (
    <div 
      className={`subnet-container min-w-[200px] min-h-[120px] border-2 border-dashed ${borderColor} ${bgColor} rounded-lg relative overflow-visible ${
        selected ? 'ring-2 ring-primary' : ''
      } ${highlightClass}`}
      data-testid={`subnet-node-${data.nodeId}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ zIndex: 2 }}
    >
      {selected && (
        <NodeResizer
          color={isPublic ? "#22c55e" : "#3b82f6"}
          isVisible={selected}
          minWidth={200}
          minHeight={120}
        />
      )}
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 border-2 border-primary bg-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 border-2 border-primary bg-background"
      />
      
      <div className={`absolute -top-3 left-3 bg-card px-2 py-1 text-xs font-semibold border rounded-lg shadow-sm ${headerColor} flex items-center gap-1 z-10`}>
        {awsIcon || <Layers className="w-3 h-3" />}
        {isPublic ? "Public" : "Private"} Subnet
      </div>
      
      <div className="absolute top-2 right-2 text-xs text-muted-foreground z-10">
        {data.params?.cidr_block || "10.0.1.0/24"}
      </div>
      
      <div className="absolute bottom-2 left-2 text-xs font-medium z-10">
        {data.name}
      </div>
      
      {/* Drop zone indicator */}
      <div className={`absolute inset-3 border-2 border-dashed ${dropZoneColor} rounded-lg flex items-center justify-center text-xs font-medium pointer-events-none`}>
        Drop services here
      </div>
    </div>
  );
}

export default memo(SubnetNode);
