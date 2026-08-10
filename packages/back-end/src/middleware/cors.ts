import { Request, Response, NextFunction } from 'express';

export default function CorsStar(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  next();
}
