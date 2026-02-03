import https from 'https';
import crypto from 'crypto';
import { IntegrationConfig } from '@forgecomply/shared';
import { AWSSecurityFinding } from './aws.types';
import { logger } from '../../utils/logger';

export class AWSSecurityHubClient {
  private region: string;
  private accessKeyId: string;
  private secretAccessKey: string;

  constructor(config: IntegrationConfig) {
    this.accessKeyId = config.credentials.accessKeyId || config.credentials.AWS_ACCESS_KEY_ID || '';
    this.secretAccessKey = config.credentials.secretAccessKey || config.credentials.AWS_SECRET_ACCESS_KEY || '';
    this.region = config.credentials.region || config.credentials.AWS_REGION || 'us-east-1';
  }

  async getFindings(nextToken?: string): Promise<{ findings: AWSSecurityFinding[]; nextToken?: string }> {
    const body = JSON.stringify({
      MaxResults: 100,
      ...(nextToken ? { NextToken: nextToken } : {}),
      Filters: {
        RecordState: [{ Value: 'ACTIVE', Comparison: 'EQUALS' }],
      },
    });

    const response = await this.signedRequest('POST', '/findings/get', body);
    return {
      findings: response.Findings || [],
      nextToken: response.NextToken,
    };
  }

  async getAllFindings(): Promise<AWSSecurityFinding[]> {
    const allFindings: AWSSecurityFinding[] = [];
    let nextToken: string | undefined;

    do {
      const result = await this.getFindings(nextToken);
      allFindings.push(...result.findings);
      nextToken = result.nextToken;
    } while (nextToken);

    logger.info(`Fetched ${allFindings.length} findings from AWS Security Hub`);
    return allFindings;
  }

  async testConnection(): Promise<boolean> {
    const body = JSON.stringify({ MaxResults: 1 });
    await this.signedRequest('POST', '/findings/get', body);
    return true;
  }

  private async signedRequest(method: string, path: string, body: string): Promise<Record<string, unknown>> {
    const host = `securityhub.${this.region}.amazonaws.com`;
    const now = new Date();
    const dateStamp = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 8);
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Host': host,
      'X-Amz-Date': amzDate,
    };

    const canonicalHeaders = Object.entries(headers)
      .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map(([k, v]) => `${k.toLowerCase()}:${v}\n`)
      .join('');
    const signedHeaders = Object.keys(headers)
      .map((k) => k.toLowerCase())
      .sort()
      .join(';');

    const payloadHash = crypto.createHash('sha256').update(body).digest('hex');
    const canonicalRequest = [method, path, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');

    const credentialScope = `${dateStamp}/${this.region}/securityhub/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const signingKey = this.getSignatureKey(dateStamp);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    headers['Authorization'] =
      `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return new Promise((resolve, reject) => {
      const req = https.request({ hostname: host, path, method, headers }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`AWS API error ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  private getSignatureKey(dateStamp: string): Buffer {
    const kDate = crypto.createHmac('sha256', `AWS4${this.secretAccessKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('securityhub').digest();
    return crypto.createHmac('sha256', kService).update('aws4_request').digest();
  }
}
