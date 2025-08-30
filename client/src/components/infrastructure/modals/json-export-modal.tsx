import { useState } from "react";
import { X, Copy, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useInfrastructureStore } from "@/stores/infrastructure-store";

export default function JsonExportModal() {
  const { toast } = useToast();
  const { jsonExportModalOpen, setJsonExportModalOpen, exportToJSON, nodes, edges } = useInfrastructureStore();

  const [jsonString, setJsonString] = useState("");

  const handleOpen = (open: boolean) => {
    if (open) {
      const data = exportToJSON();
      setJsonString(JSON.stringify(data, null, 2));
    }
    setJsonExportModalOpen(open);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      toast({
        title: "Copied to clipboard",
        description: "Infrastructure JSON copied successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "infrastructure.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Infrastructure JSON file is downloading.",
    });
  };

  const resourceCount = nodes.length;
  const dependencyCount = edges.length;

  return (
    <Dialog open={jsonExportModalOpen} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]" data-testid="json-export-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Export Infrastructure JSON
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setJsonExportModalOpen(false)}
              data-testid="button-close-modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Infrastructure Definition
            </label>
            <Textarea
              value={jsonString}
              readOnly
              className="h-64 font-mono text-sm resize-none"
              data-testid="textarea-json-output"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground" data-testid="text-export-summary">
              {resourceCount} resources, {dependencyCount} dependencies
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleCopyToClipboard}
                data-testid="button-copy-json"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button
                onClick={handleDownload}
                data-testid="button-download-json"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
