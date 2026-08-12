import { Request, Response, NextFunction } from 'express';

const ALLOWED_ORIGIN_PATTERN =  /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;
const ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const ALLOWED_HEADERS = 'Content-Type';

export default function CorsStar(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  if(origin && ALLOWED_ORIGIN_PATTERN.test(origin)){
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
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
