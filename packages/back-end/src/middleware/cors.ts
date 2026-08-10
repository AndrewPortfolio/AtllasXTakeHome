import { Request, Response, NextFunction } from 'express';

const ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const ALLOWED_HEADERS = 'Content-Type';

export default function CorsStar(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);

  // A JSON POST from the browser is preflighted; answer it here rather than letting it
  // fall through to a 404 that the fetch would report as an opaque network error.
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}
