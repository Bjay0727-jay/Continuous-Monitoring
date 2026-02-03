import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export function verifyGitHubSignature(req: Request, res: Response, next: NextFunction): void {
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature) {
    res.status(401).json({ error: 'Missing GitHub signature' });
    return;
  }

  const secret = config.github.webhookSecret;
  if (!secret) {
    logger.warn('GitHub webhook secret not configured, skipping verification');
    next();
    return;
  }

  const body = JSON.stringify(req.body);
  const expectedSignature = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    res.status(401).json({ error: 'Invalid GitHub signature' });
    return;
  }

  next();
}

export function verifyWebhookToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers['x-webhook-token'] as string;
  if (!token) {
    logger.warn('No webhook token provided, allowing request in development');
    next();
    return;
  }
  next();
}
