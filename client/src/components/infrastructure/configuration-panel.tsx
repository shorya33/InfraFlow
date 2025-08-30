import { useEffect, useState } from "react";
import {
  Server,
  Globe,
  Layers,
  Database,
  Shuffle,
  Folder,
  Shield,
  Play,
  Trash2,
  Copy,
  X, // Import X for close button
  PanelLeftClose, // Import PanelLeftClose for collapse button
  PanelRightClose, // Import PanelRightClose for collapse button
  Settings,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInfrastructureStore } from "@/stores/infrastructure-store";
import { useAwsProfileStore } from "@/stores/aws-profile-store";
import { getAwsIcon } from "@/components/icons/aws-icons";
import type { Node, NodeStatus } from "@shared/schema";

const getNodeIcon = (type: Node["type"]) => {
  switch (type) {
    case "aws_vpc": return <Globe className="w-4 h-4" />;
    case "aws_subnet": return <Layers className="w-4 h-4" />;
    case "aws_instance": return <Server className="w-4 h-4" />;
    case "aws_rds": return <Database className="w-4 h-4" />;
    case "aws_elb": return <Shuffle className="w-4 h-4" />;
    case "aws_s3_bucket": return <Folder className="w-4 h-4" />;
    case "aws_iam_role": return <Shield className="w-4 h-4" />;
    default: return <Server className="w-4 h-4" />;
  }
};

const getNodeTypeName = (type: Node["type"]) => {
  switch (type) {
    case "aws_vpc": return "AWS VPC";
    case "aws_subnet": return "AWS Subnet";
    case "aws_instance": return "AWS EC2 Instance";
    case "aws_rds": return "AWS RDS Database";
    case "aws_elb": return "AWS Load Balancer";
    case "aws_s3_bucket": return "AWS S3 Bucket";
    case "aws_iam_role": return "AWS IAM Role";
    default: return type;
  }
};

const getStatusColor = (status: NodeStatus) => {
  switch (status) {
    case "not_applied": return "bg-muted-foreground/40";
    case "creating": return "bg-blue-500 animate-pulse";
    case "created": return "bg-green-500";
    case "failed": return "bg-red-500";
    default: return "bg-muted-foreground/40";
  }
};

const getStatusText = (status: NodeStatus) => {
  switch (status) {
    case "not_applied": return "Not Applied";
    case "creating": return "Creating...";
    case "created": return "Created";
    case "failed": return "Failed";
    default: return "Unknown";
  }
};

export default function ConfigurationPanel() {
  const {
    selectedNodeId,
    getSelectedNode,
    updateNode,
    deleteNode,
    nodeStatuses,
    setNodeStatus,
    addNode,
    edges,
    nodes,
  } = useInfrastructureStore();

  const { profiles, activeProfile } = useAwsProfileStore();

  const selectedNode = getSelectedNode();
  const [formData, setFormData] = useState(selectedNode?.data || { name: "", params: {} });

  // State for sidebar collapse
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  // Check if multiple nodes are selected (simplified - could be enhanced)
  const selectedNodes = nodes.filter(node => selectedNodeId === node.id);
  const isMultiSelect = selectedNodes.length > 1;


  // Update form when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data);
    } else {
      setFormData({ name: "", params: {} });
    }
  }, [selectedNode]);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData };

    if (field.startsWith("params.")) {
      const paramField = field.replace("params.", "");
      newData.params = { ...(newData.params || {}), [paramField]: value };
    } else {
      (newData as any)[field] = value;
    }

    setFormData(newData);

    if (selectedNodeId) {
      updateNode(selectedNodeId, { data: newData });
    }
  };

  const handleApplyChanges = () => {
    if (selectedNodeId) {
      setNodeStatus(selectedNodeId, "creating");
      // Simulate deployment
      setTimeout(() => {
        setNodeStatus(selectedNodeId, "created");
      }, 2000);
    }
  };

  const handleDeleteNode = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  };

  const handleDuplicateNode = () => {
    if (selectedNode) {
      addNode(selectedNode.type, {
        x: (selectedNode.position?.x || 0) + 50,
        y: (selectedNode.position?.y || 0) + 50,
      });
    }
  };

  const getNodeDependencies = () => {
    if (!selectedNodeId) return [];
    return edges
      .filter(edge => edge.source === selectedNodeId)
      .map(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        return targetNode ? { edge, node: targetNode } : null;
      })
      .filter(Boolean);
  };

  const dependencies = getNodeDependencies();

  // Default to AWS Profiles view when no node is selected
  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <span className="font-semibold">Settings</span>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* AWS Profiles Section */}
            <div>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                AWS Profiles
              </h3>

              {profiles.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-sm">No AWS profiles configured</p>
                  <p className="text-xs mt-1">Add a profile to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <Card key={profile.id} className={`p-3 ${activeProfile?.id === profile.id ? 'ring-2 ring-primary' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{profile.profile_name}</div>
                          <div className="text-xs text-muted-foreground">{profile.region}</div>
                        </div>
                        {activeProfile?.id === profile.id && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Multi-select view
  if (isMultiSelect) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Server className="w-5 h-5" />
          <span className="font-semibold">Multiple Selection</span>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="text-center text-muted-foreground py-8">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                <Server className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">{selectedNodes.length} nodes selected</p>
              <p className="text-xs mt-1">Multi-edit coming soon</p>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Single node detail view
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getNodeIcon(selectedNode.type)}
          <span className="font-semibold">Resource Details</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteNode}
          className="w-8 h-8 p-0 text-destructive hover:text-destructive"
          data-testid="button-delete-node"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Basic Configuration */}
          <div>
            <h3 className="font-medium mb-3">Basic Configuration</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resource-name" className="text-sm font-medium">
                  Resource Name
                </Label>
                <Input
                  id="resource-name"
                  value={formData?.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-2"
                  data-testid="input-resource-name"
                />
              </div>

              {/* Type-specific fields */}
              {selectedNode.type === "aws_instance" && (
                <>
                  <div>
                    <Label htmlFor="instance-type" className="text-sm font-medium">
                      Instance Type
                    </Label>
                    <Select
                      value={formData?.params?.instance_type || "t2.micro"}
                      onValueChange={(value) => handleInputChange("params.instance_type", value)}
                    >
                      <SelectTrigger className="mt-2" data-testid="select-instance-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="t2.micro">t2.micro</SelectItem>
                        <SelectItem value="t2.small">t2.small</SelectItem>
                        <SelectItem value="t2.medium">t2.medium</SelectItem>
                        <SelectItem value="t3.micro">t3.micro</SelectItem>
                        <SelectItem value="t3.small">t3.small</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ami-id" className="text-sm font-medium">
                      AMI ID
                    </Label>
                    <Input
                      id="ami-id"
                      value={formData?.params?.ami || ""}
                      onChange={(e) => handleInputChange("params.ami", e.target.value)}
                      className="mt-2"
                      data-testid="input-ami-id"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === "aws_subnet" && (
                <>
                  <div>
                    <Label htmlFor="subnet-type" className="text-sm font-medium">
                      Subnet Type
                    </Label>
                    <Select
                      value={formData?.params?.subnet_type || "public"}
                      onValueChange={(value) => handleInputChange("params.subnet_type", value)}
                    >
                      <SelectTrigger className="mt-2" data-testid="select-subnet-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cidr-block" className="text-sm font-medium">
                      CIDR Block
                    </Label>
                    <Input
                      id="cidr-block"
                      value={formData?.params?.cidr_block || ""}
                      onChange={(e) => handleInputChange("params.cidr_block", e.target.value)}
                      className="mt-2"
                      data-testid="input-cidr-block"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === "aws_vpc" && (
                <div>
                  <Label htmlFor="vpc-cidr" className="text-sm font-medium">
                    CIDR Block
                  </Label>
                  <Input
                    id="vpc-cidr"
                    value={formData?.params?.cidr_block || ""}
                    onChange={(e) => handleInputChange("params.cidr_block", e.target.value)}
                    className="mt-2"
                    data-testid="input-vpc-cidr"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dependencies */}
          {dependencies.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Dependencies</h3>
              <div className="space-y-2">
                {dependencies.map((dep) => dep && (
                  <div
                    key={dep.edge.id}
                    className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800"
                  >
                    {getNodeIcon(dep.node.type)}
                    <span className="text-sm flex-1">{dep.node.data.name} ({getNodeTypeName(dep.node.type)})</span>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(nodeStatuses[dep.node.id] || "not_applied")}`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terraform Preview */}
          <div>
            <h3 className="font-medium mb-3">Terraform Preview</h3>
            <div className="bg-muted rounded-lg p-3 text-xs font-mono">
              <div className="text-muted-foreground mb-2"># Generated Terraform</div>
              <div className="space-y-1">
                <div>
                  <span className="text-blue-600">resource</span>{" "}
                  <span className="text-green-600">"{selectedNode.type}"</span>{" "}
                  <span className="text-yellow-600">"{formData?.name || 'untitled'}"</span> {"{"}
                </div>
                {Object.entries(formData?.params || {}).map(([key, value]) => (
                  <div key={key} className="ml-2">
                    {key} = <span className="text-green-600">"{String(value)}"</span>
                  </div>
                ))}
                <div>{"}"}</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      {!isRightSidebarCollapsed && selectedNode && (
        <div className="p-4 border-t border-border space-y-2">
          <Button
            className="w-full"
            onClick={handleApplyChanges}
            disabled={nodeStatuses[selectedNodeId!] === "creating"}
            data-testid="button-apply-changes"
          >
            <Play className="w-4 h-4 mr-2" />
            {nodeStatuses[selectedNodeId!] === "creating" ? "Applying..." : "Apply Changes"}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleDuplicateNode}
              data-testid="button-duplicate-node"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}