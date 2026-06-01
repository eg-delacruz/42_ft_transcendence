const colors: Record<string, string> = {
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  debug: '\x1b[36m', // cyan
  reset: '\x1b[0m', // reset
};

const formatError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export const logger = {
  info: (message: string, error?: any) => {
    const msg = error ? `${message} ${formatError(error)}` : message;
    console.log(
      `${colors.info}[INFO] ${new Date().toISOString()} - ${msg}${
        colors.reset
      }`
    );
  },
  warn: (message: string, error?: any) => {
    const msg = error ? `${message} ${formatError(error)}` : message;
    console.warn(
      `${colors.warn}[WARN] ${new Date().toISOString()} - ${msg}${
        colors.reset
      }`
    );
  },
  error: (message: string, error?: any) => {
    const msg = error ? `${message} ${formatError(error)}` : message;
    console.error(
      `${colors.error}[ERROR] ${new Date().toISOString()} - ${msg}${
        colors.reset
      }`
    );
  },
  debug: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const msg = error ? `${message} ${formatError(error)}` : message;
      console.log(
        `${colors.debug}[DEBUG] ${new Date().toISOString()} - ${msg}${
          colors.reset
        }`
      );
    }
  },
};
