import { Response } from 'express';
import { logger } from '@config/logger';

type StatusMessages = {
  [status: number]: string;
};

const defaultMessages: StatusMessages = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not found',
  405: 'Method not allowed',
  406: 'Not Acceptable',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

export const successResponse = (
  res: Response,
  body: any = null,
  message: string | null = null,
  status: number = 200
) => {
  const msg = message || defaultMessages[status] || defaultMessages[200];

  logger.info('[SUCCESS] ' + msg);

  return res.status(status).json({
    error: '',
    body: body ?? '',
    message: msg,
  });
};

export const errorResponse = (
  res: Response,
  message: string | null = null,
  status: number = 500,
  terminalMessage?: any
) => {
  const msg = message || defaultMessages[status] || defaultMessages[500];

  // Print error message to backend logs
  if (terminalMessage) {
    logger.error('[ERROR]' + terminalMessage);
  }

  return res.status(status).json({
    error: msg,
    body: '',
    message: msg,
  });
};
