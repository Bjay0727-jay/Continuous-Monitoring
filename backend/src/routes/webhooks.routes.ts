import { Router, Request, Response } from 'express';
import { SourceProvider } from '@forgecomply/shared';
import { getEngine } from '../engines/registry';
import { upsertFindings } from '../services/findings.service';
import { verifyGitHubSignature, verifyWebhookToken } from '../middleware/webhookAuth';
import { logger } from '../utils/logger';

const router = Router();

async function handleWebhook(provider: SourceProvider, req: Request, res: Response): Promise<void> {
  try {
    const engine = getEngine(provider);
    const findings = engine.parseWebhook(req.body, req.headers as Record<string, string>);

    if (findings.length === 0) {
      res.json({ received: 0, new: 0, updated: 0 });
      return;
    }

    const result = upsertFindings(findings);
    logger.info(`Webhook ${provider}: ${result.new} new, ${result.updated} updated findings`);

    res.json({ received: findings.length, new: result.new, updated: result.updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    logger.error(`Webhook error (${provider}): ${message}`);
    res.status(500).json({ error: message });
  }
}

router.post('/aws', verifyWebhookToken, (req: Request, res: Response) => {
  handleWebhook(SourceProvider.AWS_SECURITY_HUB, req, res);
});

router.post('/azure', verifyWebhookToken, (req: Request, res: Response) => {
  handleWebhook(SourceProvider.AZURE_DEFENDER, req, res);
});

router.post('/github', verifyGitHubSignature, (req: Request, res: Response) => {
  handleWebhook(SourceProvider.GITHUB_DEPENDABOT, req, res);
});

export { router as webhooksRouter };
