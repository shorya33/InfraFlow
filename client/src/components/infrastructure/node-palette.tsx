import { useState, useMemo } from "react";
import { 
  Globe, 
  Layers, 
  Server, 
  Database, 
  Shuffle, 
  Folder, 
  Shield,
  Search,
  X
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInfrastructureStore } from "@/stores/infrastructure-store";
import { getAwsIcon } from "@/components/icons/aws-icons";
import type { Node } from "@shared/schema";

interface NodeTemplate {
  id: string;
  type: Node["type"];
  label: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
}

const getNodeTemplate = (id: string, type: Node["type"], label: string, description: string, category: string, fallbackIcon: React.ReactNode, color: string): NodeTemplate => {
  const awsIcon = getAwsIcon(type, "w-5 h-5");
  return {
    id,
    type,
    label,
    description,
    category,
    icon: awsIcon || fallbackIcon,
    color,
  };
};

const nodeTemplates: NodeTemplate[] = [
  // Networking Resources (Green)
  getNodeTemplate(
    "vpc",
    "aws_vpc",
    "AWS VPC",
    "Virtual Private Cloud",
    "Networking",
    <Globe className="w-5 h-5" />,
    "bg-green-600"
  ),
  getNodeTemplate(
    "subnet",
    "aws_subnet",
    "AWS Subnet",
    "Network Subnet",
    "Networking",
    <Layers className="w-5 h-5" />,
    "bg-green-600"
  ),
  getNodeTemplate(
    "elb",
    "aws_elb",
    "AWS Load Balancer",
    "Elastic Load Balancer",
    "Networking",
    <Shuffle className="w-5 h-5" />,
    "bg-green-600"
  ),
  
  // Compute Resources (Blue)
  getNodeTemplate(
    "ec2",
    "aws_instance",
    "AWS EC2 Instance",
    "Virtual Server",
    "Compute",
    <Server className="w-5 h-5" />,
    "bg-blue-600"
  ),
  getNodeTemplate(
    "rds",
    "aws_rds",
    "AWS RDS Database",
    "Managed Database",
    "Compute",
    <Database className="w-5 h-5" />,
    "bg-blue-600"
  ),
  
  // Storage (Orange)
  getNodeTemplate(
    "s3",
    "aws_s3_bucket",
    "AWS S3 Bucket",
    "Object Storage",
    "Storage",
    <Folder className="w-5 h-5" />,
    "bg-orange-500"
  ),
  
  // Security & IAM (Purple)
  getNodeTemplate(
    "iam",
    "aws_iam_role",
    "AWS IAM Role",
    "Access Control",
    "Security & IAM",
    <Shield className="w-5 h-5" />,
    "bg-purple-600"
  ),
];

const categories = Array.from(new Set(nodeTemplates.map(t => t.category)));

export default function NodePalette() {
  const [draggedNode, setDraggedNode] = useState<NodeTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { addNode } = useInfrastructureStore();

  // Filter nodes based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return nodeTemplates;
    
    const query = searchQuery.toLowerCase();
    return nodeTemplates.filter((template) => {
      return (
        template.label.toLowerCase().includes(query) ||
        template.type.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Group filtered templates by category
  const filteredCategories = useMemo(() => {
    const categoriesWithNodes = Array.from(new Set(filteredTemplates.map(t => t.category)));
    return categoriesWithNodes;
  }, [filteredTemplates]);

  const handleDragStart = (event: React.DragEvent, nodeTemplate: NodeTemplate) => {
    setDraggedNode(nodeTemplate);
    event.dataTransfer.setData("application/reactflow", nodeTemplate.type);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
  };

  const handleDoubleClick = (nodeTemplate: NodeTemplate) => {
    // Add node at center of viewport when double-clicked
    addNode(nodeTemplate.type, { x: 400, y: 300 });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(0);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredTemplates.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredTemplates.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredTemplates[selectedIndex]) {
          addNode(filteredTemplates[selectedIndex].type, { x: 400, y: 300 });
          handleClearSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        handleClearSearch();
        break;
    }
  };

  return (
    <div className="h-full bg-card flex flex-col">
      {/* Sticky Header */}
      <div className="p-4 border-b border-border bg-card">
        <h2 className="font-semibold text-lg mb-2" data-testid="node-palette-title">
          Resource Library
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Drag resources to the canvas
        </p>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search AWS resources..."
            className="pl-10 pr-10 bg-background dark:bg-[#2c2c2c] text-foreground dark:text-[#f5f5f5] placeholder:text-muted-foreground"
            data-testid="search-resources-input"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
              data-testid="clear-search-button"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-sm">No matching resources found</div>
                <div className="text-xs mt-1">Try a different search term</div>
              </div>
            ) : searchQuery ? (
              // Search results view - flat list
              <div className="space-y-2">
                {filteredTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    className={`group cursor-move p-3 bg-secondary rounded-lg border transition-all duration-200 ${
                      draggedNode?.id === template.id ? 'opacity-50' : ''
                    } ${
                      index === selectedIndex ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border hover:border-primary/50'
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, template)}
                    onDragEnd={handleDragEnd}
                    onDoubleClick={() => handleDoubleClick(template)}
                    data-testid={`node-template-${template.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{template.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                          {template.type}
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Category view - default
              filteredCategories.map((category) => (
                <div key={category}>
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {nodeTemplates
                      .filter((template) => template.category === category)
                      .map((template) => (
                        <div
                          key={template.id}
                          className={`group cursor-move p-3 bg-secondary rounded-lg border border-border hover:border-primary/50 transition-all duration-200 ${
                            draggedNode?.id === template.id ? 'opacity-50' : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, template)}
                          onDragEnd={handleDragEnd}
                          onDoubleClick={() => handleDoubleClick(template)}
                          data-testid={`node-template-${template.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                              {template.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{template.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {template.description}
                              </div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/20"></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
