/**
 * HTTP Client for Inter-Service Communication
 * Handles retries, timeouts, and error handling
 */

import { RETRY_CONFIG, TIMEOUTS } from '../constants/timeouts.js';
import createLogger from './logger.js';

const logger = createLogger('http-client');

/**
 * Make HTTP request with retry logic
 * @param {string} method - HTTP method
 * @param {string} url - Full URL
 * @param {object} options - Request options
 * @returns {Promise<object>} - Response data
 */
export async function httpRequest(
  method,
  url,
  options = {}
) {
  const {
    body = null,
    headers = {},
    timeout = TIMEOUTS.HTTP_REQUEST,
    retries = RETRY_CONFIG.MAX_ATTEMPTS,
  } = options;

  let lastError;
  let attempt = 0;

  while (attempt < retries) {
    try {
      attempt++;
      logger.debug(`HTTP ${method} ${url} (attempt ${attempt}/${retries})`);

      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
      });

      clearTimeout(timeoutHandle);

      // Handle error status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          `HTTP ${response.status}: ${errorData.message || response.statusText}`
        );
        error.status = response.status;
        throw error;
      }

      const data = await response.json().catch(() => ({}));
      logger.debug(`HTTP ${method} ${url} success`);
      return data;
    } catch (error) {
      lastError = error;
      const isNetworkError = error.name === 'AbortError' || !error.status;
      const isServerError = error.status >= 500;
      const shouldRetry =
        attempt < retries &&
        ((isNetworkError && RETRY_CONFIG.RETRY_ON_NETWORK_ERROR) ||
          (isServerError && RETRY_CONFIG.RETRY_ON_SERVER_ERROR) ||
          (error.name === 'AbortError' && RETRY_CONFIG.RETRY_ON_TIMEOUT));

      if (shouldRetry) {
        const delay = Math.min(
          RETRY_CONFIG.INITIAL_BACKOFF *
            Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt - 1),
          RETRY_CONFIG.MAX_BACKOFF
        );
        logger.warn(`HTTP request failed, retrying in ${delay}ms`, {
          error: error.message,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  logger.error(`HTTP ${method} ${url} failed after ${attempt} attempts`, {
    error: lastError?.message,
  });
  throw lastError;
}

export async function get(url, options = {}) {
  return httpRequest('GET', url, options);
}

export async function post(url, body, options = {}) {
  return httpRequest('POST', url, { ...options, body });
}

export async function put(url, body, options = {}) {
  return httpRequest('PUT', url, { ...options, body });
}

export async function patch(url, body, options = {}) {
  return httpRequest('PATCH', url, { ...options, body });
}

export async function del(url, options = {}) {
  return httpRequest('DELETE', url, options);
}

export default {
  get,
  post,
  put,
  patch,
  delete: del,
};
