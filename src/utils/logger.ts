const isDev = import.meta.env.DEV;

interface Logger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export function createLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`;
  return {
    log: (...args) => { if (isDev) console.log(prefix, ...args); },
    warn: (...args) => { console.warn(prefix, ...args); },
    error: (...args) => { console.error(prefix, ...args); },
  };
}
