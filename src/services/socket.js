import { io } from 'socket.io-client';

// Initialize socket connection
const socket = io('https://emergency-backend-e33i.onrender.com', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Connection event handlers
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

/**
 * Subscribe to incident events
 * @param {Function} callback - Callback function to handle incident events
 * @returns {Function} - Cleanup function to unsubscribe
 */
export const subscribeToIncidents = (callback) => {
  // Listen for new incidents
  socket.on('new_incident', (data) => {
    console.log('New incident received:', data);
    callback({ type: 'new_incident', data });
  });

  // Listen for upvote updates
  socket.on('upvote_update', (data) => {
    console.log('Upvote update received:', data);
    callback({ type: 'upvote_update', data });
  });

  // Return cleanup function
  return () => {
    socket.off('new_incident');
    socket.off('upvote_update');
  };
};

/**
 * Emit a custom event
 * @param {string} event - Event name
 * @param {*} data - Data to send
 */
export const emitEvent = (event, data) => {
  socket.emit(event, data);
};

export default socket;
