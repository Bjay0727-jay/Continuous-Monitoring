export enum SourceProvider {
  AWS_SECURITY_HUB = 'AWS_SECURITY_HUB',
  AZURE_DEFENDER = 'AZURE_DEFENDER',
  GITHUB_DEPENDABOT = 'GITHUB_DEPENDABOT',
}

export const PROVIDER_DISPLAY_NAMES: Record<SourceProvider, string> = {
  [SourceProvider.AWS_SECURITY_HUB]: 'AWS Security Hub',
  [SourceProvider.AZURE_DEFENDER]: 'Azure Defender',
  [SourceProvider.GITHUB_DEPENDABOT]: 'GitHub Dependabot',
};
