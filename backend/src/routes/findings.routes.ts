import { Router, Request, Response } from 'express';
import { getFindings, getFindingById } from '../services/findings.service';
import { FindingsQueryParams, Severity, SourceProvider } from '@forgecomply/shared';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const params: FindingsQueryParams = {
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : undefined,
    severity: req.query.severity ? (req.query.severity as string).split(',') as Severity[] : undefined,
    source: req.query.source ? (req.query.source as string).split(',') as SourceProvider[] : undefined,
    status: req.query.status ? (req.query.status as string).split(',') : undefined,
    search: req.query.search as string | undefined,
    sortBy: req.query.sortBy as keyof FindingsQueryParams['sortBy'] | undefined,
    sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = getFindings(params);
  res.json(result);
});

router.get('/:id', (req: Request, res: Response) => {
  const finding = getFindingById(req.params.id);
  if (!finding) throw new AppError(404, 'Finding not found');
  res.json(finding);
});

export { router as findingsRouter };
