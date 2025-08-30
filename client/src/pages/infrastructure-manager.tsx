import { useEffect } from "react";
import { Network, Settings, Upload, Download, Moon, Sun, Cog } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import FlowCanvas from "@/components/infrastructure/flow-canvas";
import NodePalette from "@/components/infrastructure/node-palette";
import ConfigurationPanel from "@/components/infrastructure/configuration-panel";
import JsonExportModal from "@/components/infrastructure/modals/json-export-modal";
import AwsProfileModal from "@/components/infrastructure/modals/aws-profile-modal";
import SearchBar from "@/components/infrastructure/search-bar";
import { useInfrastructureStore } from "@/stores/infrastructure-store";
import { useAwsProfileStore } from "@/stores/aws-profile-store";
import { useTheme } from "@/components/theme/theme-provider";
import type { AwsProfilesData } from "@shared/schema";

export default function InfrastructureManager() {
  const { toast } = useToast();
  const {
    nodes,
    edges,
    exportToJSON,
    importFromJSON,
    setJsonExportModalOpen,
    jsonExportModalOpen,
    setSearchQuery,
    focusNode,
  } = useInfrastructureStore();

  const {
    setProfileModalOpen,
    getActiveProfile,
    setProfiles,
  } = useAwsProfileStore();

  const { theme, setTheme } = useTheme();

  // Fetch AWS profiles
  const { data: profilesData } = useQuery<AwsProfilesData>({
    queryKey: ["/api/aws-profiles"],
  });

  useEffect(() => {
    if (profilesData) {
      setProfiles(profilesData);
    }
  }, [profilesData, setProfiles]);

  const handleExportJSON = () => {
    setJsonExportModalOpen(true);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            importFromJSON(jsonData);
            toast({
              title: "Import Successful",
              description: "Infrastructure imported successfully.",
            });
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Invalid JSON format.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resourceCount = nodes.length;
  const dependencyCount = edges.length;
  const activeProfile = getActiveProfile();

  const handleSearchChange = (query: string, matchingNodeIds: string[]) => {
    setSearchQuery(query, matchingNodeIds);
  };

  const handleNodeFocus = (nodeId: string) => {
    focusNode(nodeId);
  };

  const handleOpenProfiles = () => {
    setProfileModalOpen(true);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="h-screen grid grid-rows-[auto_1fr_auto] bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Network className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold" data-testid="page-title">Infrastructure Manager</h1>
            <p className="text-sm text-muted-foreground">Visual AWS Resource Builder</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar
            onSearchChange={handleSearchChange}
            onNodeFocus={handleNodeFocus}
          />

          <Button
            variant="secondary"
            size="sm"
            onClick={handleImportJSON}
            data-testid="button-import-json"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import JSON
          </Button>
          <Button
            size="sm"
            onClick={handleExportJSON}
            data-testid="button-export-json"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            data-testid="button-toggle-theme"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenProfiles}
            data-testid="button-aws-profiles"
            title="AWS Profiles"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-settings"
              title="Settings"
            >
              <Cog className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-[320px_1fr_320px] h-full overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="border-r border-border overflow-hidden">
          <NodePalette />
        </div>

        {/* Canvas */}
        <div className="overflow-hidden w-full h-full relative">
          <FlowCanvas />
        </div>

        {/* Right Sidebar - Configuration Panel */}
        <div className="border-l border-border overflow-hidden">
          <ConfigurationPanel />
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="bg-card border-t border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeProfile ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className="text-sm text-muted-foreground" data-testid="text-aws-status">
              {activeProfile ? `Connected to AWS (${activeProfile.profile_name})` : 'No AWS Profile Active'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground" data-testid="text-aws-region">
            Region: {activeProfile?.region || 'Not Set'}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span data-testid="text-resource-count">{resourceCount} Resources</span>
          <span>•</span>
          <span data-testid="text-dependency-count">{dependencyCount} Dependencies</span>
        </div>
      </footer>

      {/* Modals */}
      <JsonExportModal />
      <AwsProfileModal />
    </div>
  );
}