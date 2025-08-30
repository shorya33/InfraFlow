import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Infrastructure Graph schema
export const infrastructureGraphs = pgTable("infrastructure_graphs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  data: jsonb("data").notNull(), // Complete graph JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInfrastructureGraphSchema = createInsertSchema(infrastructureGraphs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInfrastructureGraph = z.infer<typeof insertInfrastructureGraphSchema>;
export type InfrastructureGraph = typeof infrastructureGraphs.$inferSelect;

// Node data schemas
export const nodeDataSchema = z.object({
  name: z.string(),
  params: z.record(z.any()).optional(),
});

export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// Node schema
export const nodeSchema = z.object({
  id: z.string(),
  type: z.enum([
    "aws_vpc",
    "aws_subnet", 
    "aws_instance",
    "aws_rds",
    "aws_elb",
    "aws_iam_role",
    "aws_s3_bucket"
  ]),
  parent: z.string().nullable(),
  children: z.array(z.string()),
  data: nodeDataSchema,
  position: positionSchema.optional(),
});

// Edge schema
export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.literal("dependency"),
});

// Complete infrastructure graph schema
export const infrastructureDataSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

export type NodeData = z.infer<typeof nodeDataSchema>;
export type Node = z.infer<typeof nodeSchema>;
export type Edge = z.infer<typeof edgeSchema>;
export type InfrastructureData = z.infer<typeof infrastructureDataSchema>;

// Node status
export const nodeStatusSchema = z.enum(["not_applied", "creating", "created", "failed"]);
export type NodeStatus = z.infer<typeof nodeStatusSchema>;

// AWS Profile schema
export const awsProfileSchema = z.object({
  id: z.string(),
  profile_name: z.string(),
  aws_access_key_id: z.string(),
  aws_secret_access_key: z.string(),
  region: z.string(),
});

export const insertAwsProfileSchema = awsProfileSchema.omit({ id: true });

export type AwsProfile = z.infer<typeof awsProfileSchema>;
export type InsertAwsProfile = z.infer<typeof insertAwsProfileSchema>;

// AWS Profiles collection schema
export const awsProfilesDataSchema = z.object({
  active_profile: z.string().nullable(),
  profiles: z.array(awsProfileSchema),
});

export type AwsProfilesData = z.infer<typeof awsProfilesDataSchema>;
