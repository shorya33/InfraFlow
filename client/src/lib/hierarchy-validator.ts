import type { Node } from "@shared/schema";

/**
 * Validates if a node type can be placed inside a specific parent
 */
export function validateHierarchy(
  nodeType: Node["type"],
  parentId: string | null,
  allNodes: Node[]
): boolean {
  // Global resources can exist without parents
  const globalResources = ["aws_s3_bucket", "aws_iam_role"];
  if (globalResources.includes(nodeType) && !parentId) {
    return true;
  }

  // If no parent, only global resources are allowed
  if (!parentId) {
    return nodeType === "aws_vpc" || globalResources.includes(nodeType);
  }

  const parent = allNodes.find(n => n.id === parentId);
  if (!parent) return false;

  // Define valid parent-child relationships
  const validRelationships: Record<Node["type"], Node["type"][]> = {
    aws_vpc: ["aws_subnet", "aws_elb"], // VPC can contain subnets and load balancers
    aws_subnet: ["aws_instance", "aws_rds"], // Subnet can contain instances and databases
    aws_instance: [], // EC2 instances are leaf nodes
    aws_rds: [], // RDS instances are leaf nodes
    aws_elb: [], // Load balancers are leaf nodes
    aws_s3_bucket: [], // S3 buckets are global, leaf nodes
    aws_iam_role: [], // IAM roles are global, leaf nodes
  };

  const allowedChildren = validRelationships[parent.type] || [];
  return allowedChildren.includes(nodeType);
}

/**
 * Checks if moving a node would create invalid hierarchy
 */
export function validateMove(
  nodeId: string,
  newParentId: string | null,
  allNodes: Node[]
): boolean {
  const node = allNodes.find(n => n.id === nodeId);
  if (!node) return false;

  // Can't move a node to be its own child
  if (newParentId === nodeId) return false;

  // Check if the new parent is actually a descendant of this node
  const isDescendant = (potentialAncestorId: string, potentialDescendantId: string): boolean => {
    const descendant = allNodes.find(n => n.id === potentialDescendantId);
    if (!descendant || !descendant.parent) return false;
    
    if (descendant.parent === potentialAncestorId) return true;
    return isDescendant(potentialAncestorId, descendant.parent);
  };

  if (newParentId && isDescendant(nodeId, newParentId)) {
    return false;
  }

  return validateHierarchy(node.type, newParentId, allNodes);
}

/**
 * Gets valid drop targets for a given node type
 */
export function getValidDropTargets(
  nodeType: Node["type"],
  allNodes: Node[]
): string[] {
  const validTargets: string[] = [];

  // Check which existing nodes can accept this node type
  allNodes.forEach(node => {
    if (validateHierarchy(nodeType, node.id, allNodes)) {
      validTargets.push(node.id);
    }
  });

  // Add root (no parent) if valid
  if (validateHierarchy(nodeType, null, allNodes)) {
    validTargets.push("root");
  }

  return validTargets;
}
