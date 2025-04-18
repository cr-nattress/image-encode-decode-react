/**
 * Logging service for integration with Betterstack
 */

// Betterstack configuration from environment variables
const BETTERSTACK_CONFIG = {
  sourceId: process.env.REACT_APP_BETTERSTACK_SOURCE_ID || 'spawnsmart',
  sourceToken: process.env.REACT_APP_BETTERSTACK_SOURCE_TOKEN || '4LkyLpefUiqkjeda8B7E2mKx',
  host: process.env.REACT_APP_BETTERSTACK_HOST || 's1266395.eu-nbg-2.betterstackdata.com',
};

// Log levels
const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug',
};

// Queue for storing logs when direct sending fails
let logQueue = [];
const MAX_QUEUE_SIZE = 50; // Limit queue size to prevent memory issues

/**
 * Send log to Betterstack
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Log message
 * @param {Object} [metadata] - Additional metadata to include with the log
 * @returns {Promise<Response>} - Promise that resolves when log is sent
 */
const sendLog = async (level, message, metadata = {}) => {
  try {
    // Always log to console in development for debugging
    if (process.env.NODE_ENV !== 'production') {
      console[level](`[${level.toUpperCase()}] ${message}`, metadata);
      
      // If logging is not explicitly enabled in development, don't send to Betterstack
      if (process.env.REACT_APP_ENABLE_LOGGING !== 'true') {
        return;
      }
    }

    // Add timestamp and user info to metadata
    const enhancedMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      environment: process.env.NODE_ENV,
    };

    // Prepare the log payload
    const logPayload = {
      dt: enhancedMetadata.timestamp,
      level,
      message,
      source_id: BETTERSTACK_CONFIG.sourceId,
      metadata: enhancedMetadata,
    };
    
    // Only use the Netlify proxy in production environment
    if (process.env.NODE_ENV === 'production') {
      try {
        // Use Netlify function proxy to avoid CORS issues in production
        const proxyUrl = '/.netlify/functions/log-proxy';
        console.debug('Attempting to send log through proxy:', proxyUrl);
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logPayload),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Proxy responded with status: ${response.status}`, errorText);
          throw new Error(`Proxy responded with status: ${response.status}`);
        }
        
        console.debug('Successfully sent log through proxy');
        return response;
      } catch (fetchError) {
        console.warn('Failed to send log through proxy, falling back to direct send:', fetchError);
        // Fall through to direct sending if proxy fails
      }
    }
    
    // Direct sending - used in development or as fallback in production
    try {
      // Using the root endpoint as specified in the documentation
      const betterStackUrl = `https://${BETTERSTACK_CONFIG.host}/`;
      console.debug('Sending direct log to:', betterStackUrl);
      
      const directResponse = await fetch(betterStackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BETTERSTACK_CONFIG.sourceToken}`,
        },
        body: JSON.stringify(logPayload),
        mode: 'cors',
        credentials: 'omit',
      });
      
      // Check specifically for 202 status as mentioned in the documentation
      if (directResponse.status !== 202) {
        const errorText = await directResponse.text();
        console.warn(`Direct log failed with status: ${directResponse.status}`, errorText);
        throw new Error(`Direct log failed: Expected 202 status, got ${directResponse.status}`);
      }
      
      console.debug('Successfully sent log directly with 202 status');
      return directResponse;
    } catch (directError) {
      // If direct sending fails, add to queue
      console.warn('Failed to send log directly, adding to queue:', directError);
      addToLogQueue(logPayload);
      return null;
    }
  } catch (error) {
    // Don't let logging errors affect the application
    console.error('Error in logging service:', error);
    return null;
  }
};

/**
 * Add a log to the queue
 * @param {Object} logPayload - The log payload to queue
 */
const addToLogQueue = (logPayload) => {
  // Add to queue if not at max size
  if (logQueue.length < MAX_QUEUE_SIZE) {
    logQueue.push(logPayload);
  } else {
    // Remove oldest log if queue is full
    logQueue.shift();
    logQueue.push(logPayload);
  }
  
  // Store queue in localStorage for persistence
  try {
    localStorage.setItem('betterstack_log_queue', JSON.stringify(logQueue));
  } catch (e) {
    console.warn('Failed to store log queue in localStorage:', e);
  }
};

/**
 * Initialize the logging service
 * Loads any queued logs from localStorage
 */
const initLogging = () => {
  try {
    const storedQueue = localStorage.getItem('betterstack_log_queue');
    if (storedQueue) {
      const parsedQueue = JSON.parse(storedQueue);
      if (Array.isArray(parsedQueue)) {
        logQueue = parsedQueue.slice(0, MAX_QUEUE_SIZE);
      }
    }
  } catch (e) {
    console.warn('Failed to load log queue from localStorage:', e);
  }
};

// Initialize logging on service load
initLogging();

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
const logError = (errorObj, context, additionalInfo = {}) => {
  return sendLog(LOG_LEVELS.ERROR, errorObj.message, {
    context,
    stack: errorObj.stack,
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
