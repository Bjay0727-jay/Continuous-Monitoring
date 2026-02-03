import { Severity, SourceProvider, FindingStatus, UnifiedFinding } from '@forgecomply/shared';
import { AzureSecurityAlert } from './azure.types';

export function normalizeAzureAlert(
  raw: AzureSecurityAlert,
  integrationId: string
): Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'> {
  const props = raw.properties;

  return {
    externalId: raw.id || raw.name,
    source: SourceProvider.AZURE_DEFENDER,
    integrationId,
    title: props.alertDisplayName,
    description: props.description || '',
    severity: mapSeverity(props.severity),
    severityScore: mapSeverityScore(props.severity),
    status: mapStatus(props.status),
    resourceType: props.productName || 'Azure Resource',
    resourceId: props.compromisedEntity || extractResourceId(props.resourceIdentifiers),
    region: null,
    remediation: props.remediationSteps?.length ? props.remediationSteps.join('\n') : null,
    rawPayload: raw as unknown as Record<string, unknown>,
    firstSeenAt: props.startTimeUtc || props.timeGeneratedUtc,
    lastSeenAt: props.endTimeUtc || props.timeGeneratedUtc,
  };
}

function mapSeverity(level: string): Severity {
  switch (level) {
    case 'High': return Severity.HIGH;
    case 'Medium': return Severity.MEDIUM;
    case 'Low': return Severity.LOW;
    case 'Informational': return Severity.INFO;
    default: return Severity.MEDIUM;
  }
}

function mapSeverityScore(level: string): number {
  switch (level) {
    case 'High': return 80;
    case 'Medium': return 50;
    case 'Low': return 25;
    case 'Informational': return 10;
    default: return 50;
  }
}

function mapStatus(status: string): FindingStatus {
  switch (status) {
    case 'Resolved': return FindingStatus.RESOLVED;
    case 'Dismissed': return FindingStatus.SUPPRESSED;
    default: return FindingStatus.ACTIVE;
  }
}

function extractResourceId(identifiers: { type: string; azureResourceId?: string }[]): string {
  if (!identifiers?.length) return 'Unknown';
  return identifiers[0]?.azureResourceId || 'Unknown';
}
