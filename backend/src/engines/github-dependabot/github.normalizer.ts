import { Severity, SourceProvider, FindingStatus, UnifiedFinding } from '@forgecomply/shared';
import { GitHubDependabotAlert } from './github.types';

export function normalizeGitHubAlert(
  raw: GitHubDependabotAlert,
  integrationId: string,
  repoFullName?: string
): Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'> {
  const advisory = raw.security_advisory;
  const vulnerability = raw.security_vulnerability;
  const pkg = raw.dependency?.package;

  return {
    externalId: advisory?.ghsa_id || `dependabot-${raw.number}`,
    source: SourceProvider.GITHUB_DEPENDABOT,
    integrationId,
    title: advisory?.summary || `Vulnerability in ${pkg?.name || 'unknown package'}`,
    description: advisory?.description || '',
    severity: mapSeverity(advisory?.severity || vulnerability?.severity || 'medium'),
    severityScore: advisory?.cvss?.score ? advisory.cvss.score * 10 : mapSeverityScore(advisory?.severity || 'medium'),
    status: mapStatus(raw.state),
    resourceType: `${pkg?.ecosystem || 'unknown'}:package`,
    resourceId: repoFullName
      ? `${repoFullName}:${pkg?.name || 'unknown'}@${raw.dependency?.manifest_path || ''}`
      : `${pkg?.name || 'unknown'}@${raw.dependency?.manifest_path || ''}`,
    region: null,
    remediation: vulnerability?.first_patched_version
      ? `Upgrade ${pkg?.name} to ${vulnerability.first_patched_version.identifier} or later`
      : 'No patched version available yet',
    rawPayload: raw as unknown as Record<string, unknown>,
    firstSeenAt: raw.created_at,
    lastSeenAt: raw.updated_at || raw.created_at,
  };
}

function mapSeverity(level: string): Severity {
  switch (level) {
    case 'critical': return Severity.CRITICAL;
    case 'high': return Severity.HIGH;
    case 'medium': return Severity.MEDIUM;
    case 'low': return Severity.LOW;
    default: return Severity.MEDIUM;
  }
}

function mapSeverityScore(level: string): number {
  switch (level) {
    case 'critical': return 90;
    case 'high': return 70;
    case 'medium': return 50;
    case 'low': return 25;
    default: return 50;
  }
}

function mapStatus(state: string): FindingStatus {
  switch (state) {
    case 'fixed': return FindingStatus.RESOLVED;
    case 'dismissed':
    case 'auto_dismissed': return FindingStatus.SUPPRESSED;
    default: return FindingStatus.ACTIVE;
  }
}
