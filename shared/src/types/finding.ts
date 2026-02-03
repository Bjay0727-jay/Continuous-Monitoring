import { Severity } from './severity';
import { SourceProvider } from './source';

export enum FindingStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  SUPPRESSED = 'SUPPRESSED',
}

export interface UnifiedFinding {
  id: string;
  externalId: string;
  source: SourceProvider;
  integrationId: string;
  title: string;
  description: string;
  severity: Severity;
  severityScore: number;
  status: FindingStatus;
  resourceType: string;
  resourceId: string;
  region: string | null;
  remediation: string | null;
  rawPayload: Record<string, unknown>;
  firstSeenAt: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}
