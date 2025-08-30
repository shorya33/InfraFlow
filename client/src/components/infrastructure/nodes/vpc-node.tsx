import { memo, useCallback } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import { Globe } from "lucide-react";
import { getAwsIcon } from "@/components/icons/aws-icons";
import { useInfrastructureStore } from "@/stores/infrastructure-store";

interface VpcNodeProps {
  data: {
    nodeId: string;
    name: string;
    params?: {
      cidr_block?: string;
      enable_dns_hostnames?: boolean;
    };
    isHighlighted?: boolean;
    isDimmed?: boolean;
  };
  selected: boolean;
}

function VpcNode({ data, selected }: VpcNodeProps) {
  const highlightClass = data.isHighlighted ? 'ring-2 ring-yellow-400 border-yellow-400' : '';
  const awsIcon = getAwsIcon("aws_vpc", "w-5 h-5");
  
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
      className={`vpc-container min-w-[300px] min-h-[200px] border-2 border-dashed border-green-500/60 bg-green-50/50 dark:bg-green-950/10 rounded-lg relative overflow-visible ${
        selected ? 'ring-2 ring-primary' : ''
      } ${highlightClass}`}
      data-testid={`vpc-node-${data.nodeId}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ zIndex: 1 }}
    >
      {selected && (
        <NodeResizer
          color="#22c55e"
          isVisible={selected}
          minWidth={300}
          minHeight={200}
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
      
      <div className="absolute -top-3 left-4 bg-card px-3 py-1 text-sm font-semibold border rounded-lg shadow-sm flex items-center gap-2 z-10">
        {awsIcon || <Globe className="w-4 h-4 text-green-600" />}
        <span className="text-green-600">VPC</span>
        <span>•</span>
        <span>{data.params?.cidr_block || "10.0.0.0/16"}</span>
        <span>•</span>
        <span>{data.name}</span>
      </div>
      
      {/* Drop zone indicator */}
      <div className="absolute inset-4 border-2 border-dashed border-green-300/40 rounded-lg flex items-center justify-center text-green-600/40 text-sm font-medium pointer-events-none">
        Drop resources here
      </div>
    </div>
  );
}

export default memo(VpcNode);
