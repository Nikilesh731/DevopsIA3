/**
 * Unified Logger for all services
 * Provides consistent log format and levels across the system
 */

const LOG_LEVELS = {
  DEBUG: { level: 0, label: 'DEBUG' },
  INFO: { level: 1, label: 'INFO' },
  WARN: { level: 2, label: 'WARN' },
  ERROR: { level: 3, label: 'ERROR' },
};

class Logger {
  constructor(serviceName = 'unknown', level = 'INFO') {
    this.serviceName = serviceName;
    this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  }

  _format(logLevel, message, data = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level: logLevel.label,
      service: this.serviceName,
      message,
      ...data,
    };
  }

  _shouldLog(logLevel) {
    return logLevel.level >= this.level.level;
  }

  _output(logLevel, message, data) {
    if (!this._shouldLog(logLevel)) return;

    const formatted = this._format(logLevel, message, data);
    const logStr = JSON.stringify(formatted);

    if (logLevel.level >= LOG_LEVELS.ERROR.level) {
      console.error(logStr);
    } else {
      console.log(logStr);
    }
  }

  debug(message, data = {}) {
    this._output(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data = {}) {
    this._output(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data = {}) {
    this._output(LOG_LEVELS.WARN, message, data);
  }

  error(message, data = {}) {
    this._output(LOG_LEVELS.ERROR, message, data);
  }

  // Request logging
  logRequest(method, path, query = {}) {
    this.debug(`${method} ${path}`, { query });
  }

  // Response logging
  logResponse(method, path, statusCode, duration) {
    this.debug(`${method} ${path} ${statusCode}`, {
      durationMs: duration,
    });
  }

  // Event logging
  logEvent(eventType, data = {}) {
    this.info(`Event published: ${eventType}`, { eventType, ...data });
  }

  // Error logging
  logServiceError(serviceName, error) {
    this.error(`Service ${serviceName} error`, {
      service: serviceName,
      error: error.message,
      stack: error.stack,
    });
  }
}

// Export singleton instance
export default function createLogger(serviceName = 'unknown', level = 'INFO') {
  return new Logger(serviceName, level);
}

export { Logger, LOG_LEVELS };
