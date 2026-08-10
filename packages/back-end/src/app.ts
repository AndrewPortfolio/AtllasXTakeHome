import express, { NextFunction, Request, Response } from 'express';
import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { attachSequelize } from './middleware/db';
import Cors from './middleware/cors'
import IRoute from './types/IRoute';

const appCfg = {
  port: parseInt(process.env.EXPRESS_PORT) || 50000,
  hostname: process.env.EXPRESS_HOST ?? '127.0.0.1',
};

const app = express();

// Attach any middleware
app.use(Cors);
app.use(express.json({ limit: '64kb' }));
app.use(attachSequelize);

// Read all entries from the "routes" directory. Filter out any entry that is not a file.
const _ROUTES_ROOT = resolve(join(__dirname, './routes/'));
const queue = readdirSync(_ROUTES_ROOT)
  .map(entry => join(_ROUTES_ROOT, entry))
  .filter(isFile);

// For each item in the queue, inject it as an API route.
queue.forEach(entry => {
  try {
    const required = require(entry);
    if (required?.default) {
      const { route, router }: IRoute = required.default;
      app.use(route, router());

      console.log('Injected route "%s"', route);
    } else {
      console.error('Invalid route: "%s". No `default` key defined.', entry);
    }
  } catch (e) {
    console.error('Failed to inject route on entry "%s".', entry, e);
  }
});

// Anything that escapes a route handler lands here. Without this, express' default
// handler answers with an HTML error page, which a JSON client can't do much with.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  // Thrown by express.json() when the body isn't parseable.
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Request body must be valid JSON.',
    });
  }

  console.error('Unhandled error on %s %s.', req.method, req.originalUrl, err);

  return res.status(500).json({
    success: false,
    error: 'Something went wrong. Please try again.',
  });
});

app.listen(appCfg.port, appCfg.hostname, () => {
  console.log(`Listening on http://${appCfg.hostname}:${appCfg.port}/`);
});

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch (ignored) {
    return false;
  }
}
