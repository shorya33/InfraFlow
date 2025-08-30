// AWS Official Icon Components
// These are simplified SVG versions of AWS Architecture Icons

export const Ec2Icon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="4" fill="#FF9900"/>
    <path d="M24 12L32 20L24 28L16 20L24 12Z" fill="white"/>
    <path d="M12 24L20 32L28 24L20 16L12 24Z" fill="white" opacity="0.7"/>
    <path d="M24 20L32 28L24 36L16 28L24 20Z" fill="white" opacity="0.7"/>
  </svg>
);

export const S3Icon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="4" fill="#569A31"/>
    <path d="M8 16C8 14.8954 8.89543 14 10 14H38C39.1046 14 40 14.8954 40 16V32C40 33.1046 39.1046 34 38 34H10C8.89543 34 8 33.1046 8 32V16Z" fill="white"/>
    <circle cx="16" cy="20" r="2" fill="#569A31"/>
    <circle cx="24" cy="20" r="2" fill="#569A31"/>
    <circle cx="32" cy="20" r="2" fill="#569A31"/>
    <circle cx="16" cy="28" r="2" fill="#569A31"/>
    <circle cx="24" cy="28" r="2" fill="#569A31"/>
    <circle cx="32" cy="28" r="2" fill="#569A31"/>
  </svg>
);

export const VpcIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="4" fill="#7AA116"/>
    <rect x="8" y="8" width="32" height="32" rx="2" stroke="white" strokeWidth="2" fill="none"/>
    <rect x="12" y="12" width="10" height="8" rx="1" fill="white" opacity="0.8"/>
    <rect x="26" y="12" width="10" height="8" rx="1" fill="white" opacity="0.8"/>
    <rect x="12" y="28" width="24" height="8" rx="1" fill="white" opacity="0.8"/>
  </svg>
);

export const SubnetIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="4" fill="#7AA116"/>
    <rect x="10" y="14" width="28" height="20" rx="2" stroke="white" strokeWidth="2" fill="none"/>
    <rect x="14" y="18" width="6" height="4" rx="1" fill="white"/>
    <rect x="22" y="18" width="6" height="4" rx="1" fill="white"/>
    <rect x="30" y="18" width="4" height="4" rx="1" fill="white"/>
    <rect x="14" y="26" width="20" height="4" rx="1" fill="white"/>
  </svg>
);

export const RdsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="4" fill="#3F48CC"/>
    <ellipse cx="24" cy="18" rx="14" ry="4" fill="white"/>
    <rect x="10" y="18" width="28" height="12" fill="white"/>
    <ellipse cx="24" cy="30" rx="14" ry="4" fill="white"/>
    <rect x="20" y="22" width="8" height="2" fill="#3F48CC"/>
    <rect x="20" y="26" width="8" height="2" fill="#3F48CC"/>
  </svg>
);

export const ElbIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="4" fill="#FF9900"/>
    <circle cx="24" cy="24" r="12" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="16" cy="16" r="3" fill="white"/>
    <circle cx="32" cy="16" r="3" fill="white"/>
    <circle cx="16" cy="32" r="3" fill="white"/>
    <circle cx="32" cy="32" r="3" fill="white"/>
    <circle cx="24" cy="24" r="3" fill="white"/>
  </svg>
);

export const IamIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="4" fill="#DD344C"/>
    <circle cx="24" cy="16" r="6" stroke="white" strokeWidth="2" fill="none"/>
    <path d="M12 32C12 28.6863 17.3726 26 24 26C30.6274 26 36 28.6863 36 32" stroke="white" strokeWidth="2" fill="none"/>
    <rect x="18" y="12" width="12" height="2" fill="white"/>
    <rect x="20" y="36" width="8" height="2" fill="white"/>
  </svg>
);

export const getAwsIcon = (type: string, className?: string) => {
  switch (type) {
    case "aws_instance":
      return <Ec2Icon className={className} />;
    case "aws_s3_bucket":
      return <S3Icon className={className} />;
    case "aws_vpc":
      return <VpcIcon className={className} />;
    case "aws_subnet":
      return <SubnetIcon className={className} />;
    case "aws_rds":
      return <RdsIcon className={className} />;
    case "aws_elb":
      return <ElbIcon className={className} />;
    case "aws_iam_role":
      return <IamIcon className={className} />;
    default:
      return null;
  }
};