import { useState, useEffect } from "react";
import { X, Plus, Settings, Trash2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAwsProfileStore } from "@/stores/aws-profile-store";
import { useQuery } from "@tanstack/react-query";
import type { AwsProfilesData, InsertAwsProfile } from "@shared/schema";

const AWS_REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
];

export default function AwsProfileModal() {
  const { toast } = useToast();
  const {
    profileModalOpen,
    setProfileModalOpen,
    createProfile,
    deleteProfile,
    setActiveProfile,
    setProfiles,
  } = useAwsProfileStore();

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<InsertAwsProfile>({
    profile_name: "",
    aws_access_key_id: "",
    aws_secret_access_key: "",
    region: "us-east-1",
  });

  const { data: profilesData, isLoading } = useQuery<AwsProfilesData>({
    queryKey: ["/api/aws-profiles"],
    enabled: profileModalOpen,
  });

  useEffect(() => {
    if (profilesData) {
      setProfiles(profilesData);
    }
  }, [profilesData, setProfiles]);

  const handleCreateProfile = async () => {
    if (!formData.profile_name || !formData.aws_access_key_id || !formData.aws_secret_access_key) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProfile(formData);
      setFormData({
        profile_name: "",
        aws_access_key_id: "",
        aws_secret_access_key: "",
        region: "us-east-1",
      });
      setIsCreating(false);
      toast({
        title: "Profile Created",
        description: `AWS profile "${formData.profile_name}" created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create AWS profile.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProfile = async (profileId: string, profileName: string) => {
    try {
      await deleteProfile(profileId);
      toast({
        title: "Profile Deleted",
        description: `AWS profile "${profileName}" deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete AWS profile.",
        variant: "destructive",
      });
    }
  };

  const handleSetActive = async (profileId: string | null) => {
    try {
      await setActiveProfile(profileId);
      toast({
        title: "Active Profile Updated",
        description: profileId ? "AWS profile activated." : "No active profile.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update active profile.",
        variant: "destructive",
      });
    }
  };

  const profiles = profilesData?.profiles || [];
  const activeProfileId = profilesData?.active_profile;

  return (
    <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]" data-testid="aws-profile-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              AWS Profile Management
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileModalOpen(false)}
              data-testid="button-close-profile-modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Existing Profiles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">AWS Profiles</h3>
              <Button
                size="sm"
                onClick={() => setIsCreating(true)}
                disabled={isCreating}
                data-testid="button-add-profile"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Profile
              </Button>
            </div>
            
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-4 space-y-3">
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading profiles...
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No AWS profiles configured
                  </div>
                ) : (
                  profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={`p-3 border rounded-lg ${
                        activeProfileId === profile.id ? 'bg-primary/10 border-primary' : 'bg-background'
                      }`}
                      data-testid={`profile-item-${profile.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{profile.profile_name}</span>
                              {activeProfileId === profile.id && (
                                <Badge variant="default" className="text-xs">
                                  <Check className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {profile.region} • ••••{profile.aws_access_key_id.slice(-4)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {activeProfileId !== profile.id && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleSetActive(profile.id)}
                              data-testid={`button-activate-${profile.id}`}
                            >
                              Set Active
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProfile(profile.id, profile.profile_name)}
                            data-testid={`button-delete-${profile.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Create New Profile Form */}
          {isCreating && (
            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="font-medium mb-4">Create New AWS Profile</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profile-name" className="text-sm font-medium">
                    Profile Name
                  </Label>
                  <Input
                    id="profile-name"
                    value={formData.profile_name}
                    onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                    placeholder="e.g., development, production"
                    className="mt-2"
                    data-testid="input-profile-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="access-key" className="text-sm font-medium">
                    AWS Access Key ID
                  </Label>
                  <Input
                    id="access-key"
                    type="password"
                    value={formData.aws_access_key_id}
                    onChange={(e) => setFormData({ ...formData, aws_access_key_id: e.target.value })}
                    placeholder="AKIA..."
                    className="mt-2"
                    data-testid="input-access-key"
                  />
                </div>
                
                <div>
                  <Label htmlFor="secret-key" className="text-sm font-medium">
                    AWS Secret Access Key
                  </Label>
                  <Input
                    id="secret-key"
                    type="password"
                    value={formData.aws_secret_access_key}
                    onChange={(e) => setFormData({ ...formData, aws_secret_access_key: e.target.value })}
                    placeholder="Enter secret key"
                    className="mt-2"
                    data-testid="input-secret-key"
                  />
                </div>
                
                <div>
                  <Label htmlFor="region" className="text-sm font-medium">
                    AWS Region
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData({ ...formData, region: value })}
                  >
                    <SelectTrigger className="mt-2" data-testid="select-region">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AWS_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleCreateProfile}
                    className="flex-1"
                    data-testid="button-save-profile"
                  >
                    Create Profile
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsCreating(false)}
                    className="flex-1"
                    data-testid="button-cancel-profile"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}