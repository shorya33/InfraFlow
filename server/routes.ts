import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInfrastructureGraphSchema, infrastructureDataSchema, insertAwsProfileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all infrastructure graphs
  app.get("/api/infrastructure-graphs", async (req, res) => {
    try {
      const graphs = await storage.getAllInfrastructureGraphs();
      res.json(graphs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch infrastructure graphs" });
    }
  });

  // Get specific infrastructure graph
  app.get("/api/infrastructure-graphs/:id", async (req, res) => {
    try {
      const graph = await storage.getInfrastructureGraph(req.params.id);
      if (!graph) {
        return res.status(404).json({ message: "Infrastructure graph not found" });
      }
      res.json(graph);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch infrastructure graph" });
    }
  });

  // Create new infrastructure graph
  app.post("/api/infrastructure-graphs", async (req, res) => {
    try {
      const validatedData = insertInfrastructureGraphSchema.parse(req.body);
      
      // Validate the infrastructure data structure
      infrastructureDataSchema.parse(validatedData.data);
      
      const graph = await storage.createInfrastructureGraph(validatedData);
      res.status(201).json(graph);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create infrastructure graph" });
    }
  });

  // Update infrastructure graph
  app.put("/api/infrastructure-graphs/:id", async (req, res) => {
    try {
      const validatedData = insertInfrastructureGraphSchema.partial().parse(req.body);
      
      // Validate infrastructure data if provided
      if (validatedData.data) {
        infrastructureDataSchema.parse(validatedData.data);
      }
      
      const graph = await storage.updateInfrastructureGraph(req.params.id, validatedData);
      if (!graph) {
        return res.status(404).json({ message: "Infrastructure graph not found" });
      }
      res.json(graph);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update infrastructure graph" });
    }
  });

  // Delete infrastructure graph
  app.delete("/api/infrastructure-graphs/:id", async (req, res) => {
    try {
      const success = await storage.deleteInfrastructureGraph(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Infrastructure graph not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete infrastructure graph" });
    }
  });

  // Validate infrastructure JSON
  app.post("/api/infrastructure-graphs/validate", async (req, res) => {
    try {
      const validatedData = infrastructureDataSchema.parse(req.body);
      res.json({ valid: true, data: validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ valid: false, errors: error.errors });
      }
      res.status(500).json({ message: "Validation failed" });
    }
  });

  // AWS Profile management routes
  app.get("/api/aws-profiles", async (req, res) => {
    try {
      const profiles = await storage.getAwsProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AWS profiles" });
    }
  });

  app.post("/api/aws-profiles", async (req, res) => {
    try {
      const validatedData = insertAwsProfileSchema.parse(req.body);
      const profile = await storage.createAwsProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create AWS profile" });
    }
  });

  app.put("/api/aws-profiles/:id", async (req, res) => {
    try {
      const validatedData = insertAwsProfileSchema.partial().parse(req.body);
      const profile = await storage.updateAwsProfile(req.params.id, validatedData);
      if (!profile) {
        return res.status(404).json({ message: "AWS profile not found" });
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update AWS profile" });
    }
  });

  app.delete("/api/aws-profiles/:id", async (req, res) => {
    try {
      const success = await storage.deleteAwsProfile(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "AWS profile not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete AWS profile" });
    }
  });

  app.post("/api/aws-profiles/set-active/:id", async (req, res) => {
    try {
      const success = await storage.setActiveProfile(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "AWS profile not found" });
      }
      res.json({ message: "Active profile updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to set active profile" });
    }
  });

  app.post("/api/aws-profiles/clear-active", async (req, res) => {
    try {
      await storage.setActiveProfile(null);
      res.json({ message: "Active profile cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear active profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
