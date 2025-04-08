/**
 * Logging service for integration with Betterstack
 */

// Betterstack configuration
const BETTERSTACK_CONFIG = {
  sourceId: 'image_encode_decode',
  sourceToken: '4LkyLpefUiqkjeda8B7E2mKx',
  host: 's1266395.eu-nbg-2.betterstackdata.com',
};

// Log levels
const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug',
};

/**
 * Send log to Betterstack
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Log message
 * @param {Object} [metadata] - Additional metadata to include with the log
 * @returns {Promise<Response>} - Promise that resolves when log is sent
 */
const sendLog = async (level, message, metadata = {}) => {
  try {
    // Only log in production environment
    if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_ENABLE_LOGGING !== 'true') {
      // In development, just log to console
      console[level](`[${level.toUpperCase()}] ${message}`, metadata);
      return;
    }

    // Add timestamp and user info to metadata
    const enhancedMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Prepare the log payload
    const logPayload = {
      dt: enhancedMetadata.timestamp,
      level,
      message,
      source_id: BETTERSTACK_CONFIG.sourceId,
      metadata: enhancedMetadata,
    };

    // Send log to Betterstack
    const response = await fetch(`https://${BETTERSTACK_CONFIG.host}/v1/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BETTERSTACK_CONFIG.sourceToken}`,
      },
      body: JSON.stringify(logPayload),
    });

    if (!response.ok) {
      console.error('Failed to send log to Betterstack:', await response.text());
    }

    return response;
  } catch (error) {
    // Don't let logging errors affect the application
    console.error('Error sending log to Betterstack:', error);
  }
};

/**
 * Log info level message
 * @param {string} message - Log message
 * @param {Object} [metadata] - Additional metadata
 */
const info = (message, metadata) => {
  return sendLog(LOG_LEVELS.INFO, message, metadata);
};

/**
 * Log warn level message
 * @param {string} message - Log message
 * @param {Object} [metadata] - Additional metadata
 */
const warn = (message, metadata) => {
  return sendLog(LOG_LEVELS.WARN, message, metadata);
};

/**
 * Log error level message
 * @param {string} message - Log message
 * @param {Object} [metadata] - Additional metadata
 */
const error = (message, metadata) => {
  return sendLog(LOG_LEVELS.ERROR, message, metadata);
};

/**
 * Log debug level message
 * @param {string} message - Log message
 * @param {Object} [metadata] - Additional metadata
 */
const debug = (message, metadata) => {
  return sendLog(LOG_LEVELS.DEBUG, message, metadata);
};

/**
 * Log user action
 * @param {string} action - The action performed by the user
 * @param {Object} [details] - Additional details about the action
 */
const logUserAction = (action, details = {}) => {
  return info(`User Action: ${action}`, { action, ...details });
};

/**
 * Log application error
 * @param {Error} error - The error object
 * @param {string} context - The context where the error occurred
 * @param {Object} [additionalInfo] - Additional information about the error
 */
const logError = (error, context, additionalInfo = {}) => {
  return error(error.message, {
    context,
    stack: error.stack,
    ...additionalInfo,
  });
};

const loggingService = {
  info,
  warn,
  error,
  debug,
  logUserAction,
  logError,
};

export default loggingService;
