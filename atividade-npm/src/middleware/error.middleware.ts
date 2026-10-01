import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Erro interno';
  res.status(500).json({ error: message });
};