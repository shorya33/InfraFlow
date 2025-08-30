import { Moon, Sun, Monitor, ArrowLeft, Plus, Trash2, Check, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme/theme-provider";
import { useAwsProfileStore } from "@/stores/aws-profile-store";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { useState } from "react";
import type { AwsProfilesData } from "@shared/schema";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { profiles, activeProfileId, createProfile, deleteProfile, setActiveProfile } = useAwsProfileStore();
  
  const [newProfile, setNewProfile] = useState({
    name: "",
    accessKeyId: "",
    secretAccessKey: "",
    region: "us-east-1"
  });
  
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Fetch AWS profiles
  const { data: profilesData } = useQuery<AwsProfilesData>({
    queryKey: ["/api/aws-profiles"],
    queryFn: () => apiRequest("GET", "/api/aws-profiles"),
  });

  const handleAddProfile = async () => {
    if (!newProfile.name || !newProfile.accessKeyId || !newProfile.secretAccessKey) {
      return;
    }
    
    try {
      await createProfile({
        name: newProfile.name,
        access_key_id: newProfile.accessKeyId,
        secret_access_key: newProfile.secretAccessKey,
        region: newProfile.region
      });
      
      setNewProfile({
        name: "",
        accessKeyId: "",
        secretAccessKey: "",
        region: "us-east-1"
      });
    } catch (error) {
      console.error("Failed to create profile:", error);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      await deleteProfile(profileId);
    } catch (error) {
      console.error("Failed to delete profile:", error);
    }
  };

  const handleSetActiveProfile = async (profileId: string) => {
    try {
      await setActiveProfile(profileId);
    } catch (error) {
      console.error("Failed to set active profile:", error);
    }
  };

  const testConnection = async (profileId: string) => {
    setTestingConnection(profileId);
    // Simulate connection test - in real implementation, this would call AWS STS GetCallerIdentity
    setTimeout(() => {
      setTestingConnection(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-to-manager">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Infrastructure Manager
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your application preferences</p>
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Choose how the infrastructure manager looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Theme</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the theme that works best for you
                </p>
                <RadioGroup 
                  value={theme} 
                  onValueChange={setTheme}
                  className="grid grid-cols-3 gap-4"
                  data-testid="theme-selector"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                      <Sun className="w-4 h-4" />
                      Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                      <Moon className="w-4 h-4" />
                      Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                      <Monitor className="w-4 h-4" />
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Visual Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Visual Preferences</CardTitle>
              <CardDescription>
                Customize the visual appearance of your infrastructure diagrams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Node Style</Label>
                  <p className="text-sm text-muted-foreground">
                    Infrastructure nodes use n8n-inspired design with AWS icons
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Enabled
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">AWS Service Icons</Label>
                  <p className="text-sm text-muted-foreground">
                    Official AWS Architecture icons for each service type
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Enabled
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Smooth Edges</Label>
                  <p className="text-sm text-muted-foreground">
                    Curved connection lines between infrastructure resources
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Enabled
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AWS Profile Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                AWS Profiles
              </CardTitle>
              <CardDescription>
                Manage your AWS credentials for infrastructure provisioning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Profile */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Add New Profile</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profile-name">Profile Name</Label>
                    <Input
                      id="profile-name"
                      placeholder="e.g., dev, prod"
                      value={newProfile.name}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Default Region</Label>
                    <Select value={newProfile.region} onValueChange={(value) => setNewProfile(prev => ({ ...prev, region: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                        <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                        <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                        <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="access-key">AWS Access Key ID</Label>
                    <Input
                      id="access-key"
                      type="password"
                      placeholder="AKIA..."
                      value={newProfile.accessKeyId}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, accessKeyId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secret-key">AWS Secret Access Key</Label>
                    <Input
                      id="secret-key"
                      type="password"
                      placeholder="Enter secret access key"
                      value={newProfile.secretAccessKey}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, secretAccessKey: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleAddProfile} disabled={!newProfile.name || !newProfile.accessKeyId || !newProfile.secretAccessKey}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Profile
                </Button>
              </div>

              {/* Existing Profiles */}
              {profilesData && profilesData.profiles.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-base font-medium">Saved Profiles</Label>
                  <div className="space-y-3">
                    {profilesData.profiles.map((profile) => (
                      <Card key={profile.id} className={`${profilesData.active_profile === profile.id ? 'ring-2 ring-primary' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{profile.name}</h4>
                                {profilesData.active_profile === profile.id && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Region: {profile.region} • Key: {profile.access_key_id.substring(0, 8)}...
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => testConnection(profile.id)}
                                disabled={testingConnection === profile.id}
                              >
                                {testingConnection === profile.id ? "Testing..." : "Test"}
                              </Button>
                              {profilesData.active_profile !== profile.id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetActiveProfile(profile.id)}
                                >
                                  Set as Default
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProfile(profile.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {profilesData && profilesData.profiles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No AWS profiles configured yet.</p>
                  <p className="text-sm">Add your first profile above to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}