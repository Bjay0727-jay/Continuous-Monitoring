import { Router, Request, Response } from 'express';
import { getDashboardSummary } from '../services/dashboard.service';

const router = Router();

router.get('/summary', (_req: Request, res: Response) => {
  const summary = getDashboardSummary();
  res.json(summary);
});

export { router as dashboardRouter };
