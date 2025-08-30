import VpcNode from "@/components/infrastructure/nodes/vpc-node";
import SubnetNode from "@/components/infrastructure/nodes/subnet-node";
import ServiceNode from "@/components/infrastructure/nodes/service-node";

export const getNodeTypes = () => ({
  aws_vpc: VpcNode,
  aws_subnet: SubnetNode,
  aws_instance: ServiceNode,
  aws_rds: ServiceNode,
  aws_elb: ServiceNode,
  aws_s3_bucket: ServiceNode,
  aws_iam_role: ServiceNode,
});
