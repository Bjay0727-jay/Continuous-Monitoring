export interface AWSSecurityFinding {
  SchemaVersion: string;
  Id: string;
  ProductArn: string;
  GeneratorId: string;
  AwsAccountId: string;
  Types: string[];
  FirstObservedAt?: string;
  LastObservedAt?: string;
  CreatedAt: string;
  UpdatedAt: string;
  Severity: {
    Label: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
    Normalized: number;
  };
  Title: string;
  Description: string;
  Remediation?: {
    Recommendation?: {
      Text?: string;
      Url?: string;
    };
  };
  Resources: {
    Type: string;
    Id: string;
    Region?: string;
  }[];
  Compliance?: {
    Status?: 'PASSED' | 'FAILED' | 'WARNING' | 'NOT_AVAILABLE';
  };
  Workflow?: {
    Status?: 'NEW' | 'NOTIFIED' | 'RESOLVED' | 'SUPPRESSED';
  };
  RecordState: 'ACTIVE' | 'ARCHIVED';
}

export interface GetFindingsResponse {
  Findings: AWSSecurityFinding[];
  NextToken?: string;
}
