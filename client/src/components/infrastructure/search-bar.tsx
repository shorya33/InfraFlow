import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInfrastructureStore } from "@/stores/infrastructure-store";
import type { Node } from "@shared/schema";

const getNodeIcon = (type: Node["type"]) => {
  const iconMap = {
    aws_vpc: "🌐",
    aws_subnet: "📱", 
    aws_instance: "🖥️",
    aws_rds: "🗄️",
    aws_elb: "⚖️",
    aws_s3_bucket: "🪣",
    aws_iam_role: "🛡️",
  };
  return iconMap[type] || "📦";
};

const getNodeTypeName = (type: Node["type"]) => {
  switch (type) {
    case "aws_vpc": return "VPC";
    case "aws_subnet": return "Subnet";
    case "aws_instance": return "EC2 Instance";
    case "aws_rds": return "RDS Database";
    case "aws_elb": return "Load Balancer";
    case "aws_s3_bucket": return "S3 Bucket";
    case "aws_iam_role": return "IAM Role";
    default: return type;
  }
};

interface SearchBarProps {
  onSearchChange: (query: string, matchingNodeIds: string[]) => void;
  onNodeFocus: (nodeId: string) => void;
}

export default function SearchBar({ onSearchChange, onNodeFocus }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { nodes } = useInfrastructureStore();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return nodes.filter((node) => {
      return (
        node.id.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query) ||
        node.data.name.toLowerCase().includes(query)
      );
    });
  }, [nodes, searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setShowResults(!!query.trim());
    
    const matchingIds = query.trim() ? searchResults.map(node => node.id) : [];
    onSearchChange(query, matchingIds);
  };

  const handleResultClick = (nodeId: string) => {
    onNodeFocus(nodeId);
    setShowResults(false);
    setSearchQuery("");
    onSearchChange("", []);
  };

  const handleClear = () => {
    setSearchQuery("");
    setShowResults(false);
    onSearchChange("", []);
  };

  return (
    <div className="relative w-64">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search resources..."
          className="pl-10 pr-10"
          data-testid="input-search-resources"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
            data-testid="button-clear-search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50">
          <ScrollArea className="max-h-64">
            <div className="p-2">
              {searchResults.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 text-sm">
                  No matching resources found
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => handleResultClick(node.id)}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                      data-testid={`search-result-${node.id}`}
                    >
                      <span className="text-lg">{getNodeIcon(node.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {node.data.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {getNodeTypeName(node.type)} • {node.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}