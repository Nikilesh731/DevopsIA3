/**
 * In-Memory Event Bus
 * Simple pub-sub abstraction for the distributed system
 */

class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 10000;
  }

  /**
   * Subscribe to an event type
   * @param {string} eventType - Event type to subscribe to (or '*' for all)
   * @param {function} handler - Handler function
   * @returns {function} - Unsubscribe function
   */
  on(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(eventType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to event once only
   * @param {string} eventType - Event type
   * @param {function} handler - Handler function
   * @returns {function} - Unsubscribe function
   */
  once(eventType, handler) {
    const wrappedHandler = (event) => {
      handler(event);
      unsubscribe();
    };
    const unsubscribe = this.on(eventType, wrappedHandler);
    return unsubscribe;
  }

  /**
   * Publish an event
   * @param {object} event - Event object with eventType, timestamp, data
   */
  emit(event) {
    if (!event || !event.eventType) {
      throw new Error('Event must have eventType');
    }

    // Store in history
    this._addToHistory(event);

    // Notify specific subscribers
    const handlers = this.subscribers.get(event.eventType) || [];
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.eventType}:`, error);
      }
    });

    // Notify wildcard subscribers
    const wildcardHandlers = this.subscribers.get('*') || [];
    wildcardHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in wildcard event handler:`, error);
      }
    });
  }

  /**
   * Get event history
   * @param {string} eventType - Filter by event type (optional)
   * @param {number} limit - Maximum number of events to return
   * @returns {array} - Array of events
   */
  getHistory(eventType = null, limit = 100) {
    let history = this.eventHistory;
    if (eventType) {
      history = history.filter((e) => e.eventType === eventType);
    }
    return history.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
  }

  /**
   * Get subscriber count
   * @param {string} eventType - Event type (optional)
   * @returns {number} - Number of subscribers
   */
  getSubscriberCount(eventType = null) {
    if (eventType) {
      return (this.subscribers.get(eventType) || []).length;
    }
    let total = 0;
    this.subscribers.forEach((handlers) => {
      total += handlers.length;
    });
    return total;
  }

  /**
   * Add event to history (internal)
   * @private
   */
  _addToHistory(event) {
    this.eventHistory.push({
      ...event,
      receivedAt: new Date().toISOString(),
    });

    // Keep history size bounded
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
}

// Export singleton
export const eventBus = new EventBus();

export default eventBus;
