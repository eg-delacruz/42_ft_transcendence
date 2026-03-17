import { Request } from 'express';

export const getBaseUrl = (req: Request): string => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host');

  return `${protocol}://${host}`;
};
