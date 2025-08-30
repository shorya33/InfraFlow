import { memo } from "react";
import { Handle, Position } from "reactflow";
import { 
  Server, 
  Database, 
  Shuffle, 
  Folder, 
  Shield 
} from "lucide-react";
import { getAwsIcon } from "@/components/icons/aws-icons";
import type { Node, NodeStatus } from "@shared/schema";

interface ServiceNodeProps {
  data: {
    nodeId: string;
    nodeType: Node["type"];
    name: string;
    params?: Record<string, any>;
    isHighlighted?: boolean;
    isDimmed?: boolean;
  };
  selected: boolean;
}

const getServiceIcon = (type: Node["type"]) => {
  switch (type) {
    case "aws_instance": return <Server className="w-5 h-5" />;
    case "aws_rds": return <Database className="w-5 h-5" />;
    case "aws_elb": return <Shuffle className="w-5 h-5" />;
    case "aws_s3_bucket": return <Folder className="w-5 h-5" />;
    case "aws_iam_role": return <Shield className="w-5 h-5" />;
    default: return <Server className="w-5 h-5" />;
  }
};

const getServiceColor = (type: Node["type"]) => {
  // AWS Color coding by category
  switch (type) {
    case "aws_instance": return "bg-blue-600"; // Compute - Blue
    case "aws_rds": return "bg-blue-600"; // Database/Compute - Blue
    case "aws_elb": return "bg-orange-500"; // Networking - Orange
    case "aws_s3_bucket": return "bg-green-600"; // Storage - Green
    case "aws_iam_role": return "bg-purple-600"; // Security - Purple
    case "aws_vpc": return "bg-green-600"; // Networking - Green
    case "aws_subnet": return "bg-green-600"; // Networking - Green
    default: return "bg-gray-500";
  }
};

const getServiceName = (type: Node["type"]) => {
  switch (type) {
    case "aws_instance": return "AWS EC2 Instance";
    case "aws_rds": return "AWS RDS Database";
    case "aws_elb": return "AWS Load Balancer";
    case "aws_s3_bucket": return "AWS S3 Bucket";
    case "aws_iam_role": return "AWS IAM Role";
    default: return type;
  }
};

const getStatusColor = (status?: NodeStatus) => {
  switch (status) {
    case "not_applied": return "bg-muted-foreground/40";
    case "creating": return "bg-blue-500 animate-pulse";
    case "created": return "bg-green-500";
    case "failed": return "bg-red-500";
    default: return "bg-muted-foreground/40";
  }
};

function ServiceNode({ data, selected }: ServiceNodeProps) {
  const iconColor = getServiceColor(data.nodeType);
  const serviceIcon = getServiceIcon(data.nodeType);
  const serviceName = getServiceName(data.nodeType);
  const highlightClass = data.isHighlighted ? 'ring-2 ring-yellow-400 border-yellow-400' : '';

  // Mock status - in real app this would come from store
  const status: NodeStatus = "created";

  const awsIcon = getAwsIcon(data.nodeType, "w-6 h-6");
  const fallbackIcon = serviceIcon;

  return (
    <div 
      className={`n8n-node bg-card border border-border rounded-xl p-4 cursor-pointer group min-w-[220px] ${
        selected ? 'ring-2 ring-primary shadow-lg' : ''
      } ${highlightClass}`}
      data-testid={`service-node-${data.nodeId}`}
    >
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
      
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
          {awsIcon || fallbackIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate text-foreground">{data.name}</div>
          <div className="text-xs text-muted-foreground truncate">{serviceName}</div>
          {data.params && Object.keys(data.params).length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {Object.entries(data.params).slice(0, 1).map(([key, value]) => (
                <span key={key}>{key}: {String(value).slice(0, 20)}</span>
              ))}
            </div>
          )}
        </div>
        <div 
          className={`w-3 h-3 rounded-full ${getStatusColor(status)} flex-shrink-0`} 
          title={status}
        />
      </div>
    </div>
  );
}

export default memo(ServiceNode);
