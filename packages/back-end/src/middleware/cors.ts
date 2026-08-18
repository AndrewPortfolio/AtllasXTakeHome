import { Request, Response, NextFunction } from 'express';

// Loopback plus the private LAN ranges, so a phone on the same Wi-Fi can reach the API
const ALLOWED_HOSTS = [
  'localhost',
  '127\\.0\\.0\\.1',
  '10(?:\\.\\d{1,3}){3}',
  '192\\.168(?:\\.\\d{1,3}){2}',
  '172\\.(?:1[6-9]|2\\d|3[01])(?:\\.\\d{1,3}){2}',
].join('|');

const ALLOWED_ORIGIN_PATTERN = new RegExp(`^https?://(?:${ALLOWED_HOSTS}):\\d+$`);
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
