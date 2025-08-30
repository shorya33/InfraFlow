import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AwsProfile, InsertAwsProfile, AwsProfilesData } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AwsProfileStore {
  // State
  profiles: AwsProfile[];
  activeProfileId: string | null;
  profileModalOpen: boolean;
  
  // Actions
  setProfiles: (data: AwsProfilesData) => void;
  createProfile: (profile: InsertAwsProfile) => Promise<void>;
  updateProfile: (id: string, profile: Partial<InsertAwsProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setActiveProfile: (profileId: string | null) => Promise<void>;
  setProfileModalOpen: (open: boolean) => void;
  
  // Helpers
  getActiveProfile: () => AwsProfile | null;
}

export const useAwsProfileStore = create<AwsProfileStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      profiles: [],
      activeProfileId: null,
      profileModalOpen: false,

      // Actions
      setProfiles: (data) => {
        set({
          profiles: data.profiles,
          activeProfileId: data.active_profile,
        });
      },

      createProfile: async (profile) => {
        try {
          await apiRequest("POST", "/api/aws-profiles", profile);
          
          // Invalidate and refetch profiles
          queryClient.invalidateQueries({ queryKey: ["/api/aws-profiles"] });
        } catch (error) {
          console.error("Failed to create AWS profile:", error);
          throw error;
        }
      },

      updateProfile: async (id, profile) => {
        try {
          await apiRequest("PUT", `/api/aws-profiles/${id}`, profile);
          
          // Invalidate and refetch profiles
          queryClient.invalidateQueries({ queryKey: ["/api/aws-profiles"] });
        } catch (error) {
          console.error("Failed to update AWS profile:", error);
          throw error;
        }
      },

      deleteProfile: async (id) => {
        try {
          await apiRequest("DELETE", `/api/aws-profiles/${id}`);
          
          // Invalidate and refetch profiles
          queryClient.invalidateQueries({ queryKey: ["/api/aws-profiles"] });
        } catch (error) {
          console.error("Failed to delete AWS profile:", error);
          throw error;
        }
      },

      setActiveProfile: async (profileId) => {
        try {
          if (profileId) {
            await apiRequest("POST", `/api/aws-profiles/set-active/${profileId}`);
          } else {
            await apiRequest("POST", "/api/aws-profiles/clear-active");
          }
          
          // Invalidate and refetch profiles
          queryClient.invalidateQueries({ queryKey: ["/api/aws-profiles"] });
        } catch (error) {
          console.error("Failed to set active profile:", error);
          throw error;
        }
      },

      setProfileModalOpen: (open) => {
        set({ profileModalOpen: open });
      },

      // Helpers
      getActiveProfile: () => {
        const state = get();
        if (!state.activeProfileId) return null;
        return state.profiles.find(p => p.id === state.activeProfileId) || null;
      },
    }),
    { name: "aws-profile-store" }
  )
);