import https from 'https';
import { IntegrationConfig } from '@forgecomply/shared';
import { AzureSecurityAlert, AzureAlertListResponse, AzureTokenResponse } from './azure.types';
import { logger } from '../../utils/logger';

export class AzureDefenderClient {
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;
  private subscriptionId: string;
  private accessToken: string | null = null;

  constructor(config: IntegrationConfig) {
    this.tenantId = config.credentials.tenantId || config.credentials.AZURE_TENANT_ID || '';
    this.clientId = config.credentials.clientId || config.credentials.AZURE_CLIENT_ID || '';
    this.clientSecret = config.credentials.clientSecret || config.credentials.AZURE_CLIENT_SECRET || '';
    this.subscriptionId = config.credentials.subscriptionId || config.credentials.AZURE_SUBSCRIPTION_ID || '';
  }

  async authenticate(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'https://management.azure.com/.default',
    }).toString();

    const response = await this.httpsPost(
      `login.microsoftonline.com`,
      `/${this.tenantId}/oauth2/v2.0/token`,
      body,
      { 'Content-Type': 'application/x-www-form-urlencoded' }
    ) as AzureTokenResponse;

    this.accessToken = response.access_token;
    return this.accessToken;
  }

  async getAlerts(): Promise<AzureSecurityAlert[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const allAlerts: AzureSecurityAlert[] = [];
    let nextLink: string | undefined =
      `/subscriptions/${this.subscriptionId}/providers/Microsoft.Security/alerts?api-version=2022-01-01`;

    while (nextLink) {
      const response = await this.httpsGet(
        'management.azure.com',
        nextLink,
        { Authorization: `Bearer ${this.accessToken}` }
      ) as AzureAlertListResponse;

      allAlerts.push(...(response.value || []));
      nextLink = response.nextLink ? new URL(response.nextLink).pathname + new URL(response.nextLink).search : undefined;
    }

    logger.info(`Fetched ${allAlerts.length} alerts from Azure Defender`);
    return allAlerts;
  }

  async testConnection(): Promise<boolean> {
    await this.authenticate();
    return true;
  }

  private httpsGet(host: string, path: string, headers: Record<string, string>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const req = https.request({ hostname: host, path, method: 'GET', headers: { ...headers, 'Accept': 'application/json' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Azure API error ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  private httpsPost(host: string, path: string, body: string, headers: Record<string, string>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: host, path, method: 'POST',
        headers: { ...headers, 'Content-Length': Buffer.byteLength(body).toString() }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Azure auth error ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}
