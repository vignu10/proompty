type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    // JSON format for production (easy to parse by log aggregators)
    return JSON.stringify(entry);
  }

  // Human-readable format for development
  const { timestamp, level, message, context, error } = entry;
  let output = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

  if (context && Object.keys(context).length > 0) {
    output += ` ${JSON.stringify(context)}`;
  }

  if (error) {
    output += `\n  Error: ${error.name}: ${error.message}`;
    if (error.stack) {
      output += `\n  Stack: ${error.stack}`;
    }
  }

  return output;
}

function createEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  if (!shouldLog(level)) return;

  const entry = createEntry(level, message, context, error);
  const formatted = formatEntry(entry);

  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext, error?: Error) => log('warn', message, context, error),
  error: (message: string, context?: LogContext, error?: Error) => log('error', message, context, error),

  /**
   * Log an API request
   */
  request: (method: string, path: string, context?: LogContext) => {
    log('info', `${method} ${path}`, context);
  },

  /**
   * Log an API response
   */
  response: (method: string, path: string, statusCode: number, durationMs?: number) => {
    log('info', `${method} ${path} ${statusCode}`, { durationMs });
  },

  /**
   * Log a database query (debug level)
   */
  query: (query: string, params?: unknown[], durationMs?: number) => {
    log('debug', 'Database query', { query, params, durationMs });
  },

  /**
   * Log an external API call
   */
  external: (service: string, action: string, context?: LogContext) => {
    log('info', `External API: ${service} - ${action}`, context);
  },
};

export type { LogLevel, LogContext, LogEntry };
