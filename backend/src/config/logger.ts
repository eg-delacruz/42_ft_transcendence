const colors: Record<string, string> = {
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m', // reset
};

export const logger = {
  info: (message: string) => {
    console.log(
      `${colors.info}[INFO] ${new Date().toISOString()} - ${message}${
        colors.reset
      }`
    );
  },
  warn: (message: string) => {
    console.warn(
      `${colors.warn}[WARN] ${new Date().toISOString()} - ${message}${
        colors.reset
      }`
    );
  },
  error: (message: string) => {
    console.error(
      `${colors.error}[ERROR] ${new Date().toISOString()} - ${message}${
        colors.reset
      }`
    );
  },
};
