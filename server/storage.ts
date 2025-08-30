import { type InfrastructureGraph, type InsertInfrastructureGraph, type AwsProfile, type InsertAwsProfile, type AwsProfilesData } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Infrastructure graph operations
  getInfrastructureGraph(id: string): Promise<InfrastructureGraph | undefined>;
  getAllInfrastructureGraphs(): Promise<InfrastructureGraph[]>;
  createInfrastructureGraph(graph: InsertInfrastructureGraph): Promise<InfrastructureGraph>;
  updateInfrastructureGraph(id: string, graph: Partial<InsertInfrastructureGraph>): Promise<InfrastructureGraph | undefined>;
  deleteInfrastructureGraph(id: string): Promise<boolean>;
  
  // AWS Profile operations
  getAwsProfiles(): Promise<AwsProfilesData>;
  createAwsProfile(profile: InsertAwsProfile): Promise<AwsProfile>;
  updateAwsProfile(id: string, profile: Partial<InsertAwsProfile>): Promise<AwsProfile | undefined>;
  deleteAwsProfile(id: string): Promise<boolean>;
  setActiveProfile(profileId: string | null): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, any>;
  private infrastructureGraphs: Map<string, InfrastructureGraph>;
  private awsProfiles: Map<string, AwsProfile>;
  private activeProfileId: string | null;

  constructor() {
    this.users = new Map();
    this.infrastructureGraphs = new Map();
    this.awsProfiles = new Map();
    this.activeProfileId = null;
  }

  async getUser(id: string): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = randomUUID();
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getInfrastructureGraph(id: string): Promise<InfrastructureGraph | undefined> {
    return this.infrastructureGraphs.get(id);
  }

  async getAllInfrastructureGraphs(): Promise<InfrastructureGraph[]> {
    return Array.from(this.infrastructureGraphs.values());
  }

  async createInfrastructureGraph(insertGraph: InsertInfrastructureGraph): Promise<InfrastructureGraph> {
    const id = randomUUID();
    const now = new Date();
    const graph: InfrastructureGraph = {
      ...insertGraph,
      id,
      createdAt: now,
      updatedAt: now,
      description: insertGraph.description || null,
    };
    this.infrastructureGraphs.set(id, graph);
    return graph;
  }

  async updateInfrastructureGraph(id: string, updates: Partial<InsertInfrastructureGraph>): Promise<InfrastructureGraph | undefined> {
    const existing = this.infrastructureGraphs.get(id);
    if (!existing) return undefined;

    const updated: InfrastructureGraph = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.infrastructureGraphs.set(id, updated);
    return updated;
  }

  async deleteInfrastructureGraph(id: string): Promise<boolean> {
    return this.infrastructureGraphs.delete(id);
  }

  async getAwsProfiles(): Promise<AwsProfilesData> {
    return {
      active_profile: this.activeProfileId,
      profiles: Array.from(this.awsProfiles.values()),
    };
  }

  async createAwsProfile(insertProfile: InsertAwsProfile): Promise<AwsProfile> {
    const id = randomUUID();
    const profile: AwsProfile = {
      ...insertProfile,
      id,
    };
    this.awsProfiles.set(id, profile);
    
    // If this is the first profile, make it active
    if (this.awsProfiles.size === 1) {
      this.activeProfileId = id;
    }
    
    return profile;
  }

  async updateAwsProfile(id: string, updates: Partial<InsertAwsProfile>): Promise<AwsProfile | undefined> {
    const existing = this.awsProfiles.get(id);
    if (!existing) return undefined;

    const updated: AwsProfile = {
      ...existing,
      ...updates,
    };
    this.awsProfiles.set(id, updated);
    return updated;
  }

  async deleteAwsProfile(id: string): Promise<boolean> {
    const deleted = this.awsProfiles.delete(id);
    
    // If the deleted profile was active, clear active profile
    if (this.activeProfileId === id) {
      this.activeProfileId = null;
    }
    
    return deleted;
  }

  async setActiveProfile(profileId: string | null): Promise<boolean> {
    if (profileId && !this.awsProfiles.has(profileId)) {
      return false;
    }
    this.activeProfileId = profileId;
    return true;
  }
}

export const storage = new MemStorage();
