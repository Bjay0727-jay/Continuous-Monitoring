import https from 'https';
import { IntegrationConfig } from '@forgecomply/shared';
import { GitHubDependabotAlert } from './github.types';
import { logger } from '../../utils/logger';

export class GitHubDependabotClient {
  private token: string;
  private owner: string;
  private repo: string;

  constructor(config: IntegrationConfig) {
    this.token = config.credentials.token || config.credentials.GITHUB_TOKEN || '';
    const repoPath = config.credentials.repository || config.credentials.GITHUB_REPOSITORY || '';
    const parts = repoPath.split('/');
    this.owner = parts[0] || '';
    this.repo = parts[1] || '';
  }

  get repoFullName(): string {
    return `${this.owner}/${this.repo}`;
  }

  async getAlerts(): Promise<GitHubDependabotAlert[]> {
    const allAlerts: GitHubDependabotAlert[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const path = `/repos/${this.owner}/${this.repo}/dependabot/alerts?state=open&per_page=${perPage}&page=${page}`;
      const alerts = await this.apiGet(path) as GitHubDependabotAlert[];

      if (!Array.isArray(alerts) || alerts.length === 0) break;
      allAlerts.push(...alerts);

      if (alerts.length < perPage) break;
      page++;
    }

    logger.info(`Fetched ${allAlerts.length} Dependabot alerts from ${this.repoFullName}`);
    return allAlerts;
  }

  async testConnection(): Promise<boolean> {
    const path = `/repos/${this.owner}/${this.repo}`;
    await this.apiGet(path);
    return true;
  }

  private apiGet(path: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.github.com',
        path,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'ForgeComply-360',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`GitHub API error ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }
}
