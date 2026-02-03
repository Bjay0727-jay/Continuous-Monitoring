import { SourceProvider } from '@forgecomply/shared';
import { IIntegrationEngine } from './engine.interface';
import { AWSSecurityHubEngine } from './aws-security-hub/aws.engine';
import { AzureDefenderEngine } from './azure-defender/azure.engine';
import { GitHubDependabotEngine } from './github-dependabot/github.engine';

const engines: Record<SourceProvider, IIntegrationEngine> = {
  [SourceProvider.AWS_SECURITY_HUB]: new AWSSecurityHubEngine(),
  [SourceProvider.AZURE_DEFENDER]: new AzureDefenderEngine(),
  [SourceProvider.GITHUB_DEPENDABOT]: new GitHubDependabotEngine(),
};

export function getEngine(provider: SourceProvider): IIntegrationEngine {
  const engine = engines[provider];
  if (!engine) {
    throw new Error(`No engine registered for provider: ${provider}`);
  }
  return engine;
}

export function getAllEngines(): Record<SourceProvider, IIntegrationEngine> {
  return engines;
}
