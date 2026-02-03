import { Severity, SourceProvider, FindingStatus, UnifiedFinding } from '@forgecomply/shared';
import { AWSSecurityFinding } from './aws.types';

export function normalizeAWSFinding(
  raw: AWSSecurityFinding,
  integrationId: string
): Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    externalId: raw.Id,
    source: SourceProvider.AWS_SECURITY_HUB,
    integrationId,
    title: raw.Title,
    description: raw.Description || '',
    severity: mapSeverity(raw.Severity.Label),
    severityScore: raw.Severity.Normalized,
    status: mapStatus(raw),
    resourceType: raw.Resources?.[0]?.Type || 'Unknown',
    resourceId: raw.Resources?.[0]?.Id || 'Unknown',
    region: raw.Resources?.[0]?.Region || null,
    remediation: raw.Remediation?.Recommendation?.Text || null,
    rawPayload: raw as unknown as Record<string, unknown>,
    firstSeenAt: raw.FirstObservedAt || raw.CreatedAt,
    lastSeenAt: raw.LastObservedAt || raw.UpdatedAt,
  };
}

function mapSeverity(label: string): Severity {
  switch (label) {
    case 'CRITICAL': return Severity.CRITICAL;
    case 'HIGH': return Severity.HIGH;
    case 'MEDIUM': return Severity.MEDIUM;
    case 'LOW': return Severity.LOW;
    default: return Severity.INFO;
  }
}

function mapStatus(finding: AWSSecurityFinding): FindingStatus {
  if (finding.RecordState === 'ARCHIVED') return FindingStatus.RESOLVED;
  if (finding.Workflow?.Status === 'RESOLVED') return FindingStatus.RESOLVED;
  if (finding.Workflow?.Status === 'SUPPRESSED') return FindingStatus.SUPPRESSED;
  return FindingStatus.ACTIVE;
}
