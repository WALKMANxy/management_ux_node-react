// src/store/listeners.ts
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { addMessage, updateReadStatus } from '../features/chat/chatSlice';
import { webSocketService } from '../services/webSocketService';
import store from './store';

// Create the listener middleware instance
const listenerMiddleware = createListenerMiddleware();

// Function to emit WebSocket events
const handleWebSocketEvents = (event: string, payload: any) => {
  switch (event) {
    case 'chat:newMessage':
      store.dispatch(addMessage(payload)); // Dispatch action to add message
      break;
    case 'chat:messageRead':
      store.dispatch(updateReadStatus(payload)); // Dispatch action to update read status
      break;
    default:
      console.warn(`Unhandled WebSocket event: ${event}`);
  }
};

// Inject the listener middleware as the event emitter for WebSocketService
webSocketService.injectEventEmitter(handleWebSocketEvents);

// Listener for handling message sending (optimistic update)
listenerMiddleware.startListening({
  actionCreator: addMessage,
  effect: (action, listenerApi) => {
    console.log('New message received via WebSocket:', action.payload);
  },
});

// Listener for updating read statuses
listenerMiddleware.startListening({
  actionCreator: updateReadStatus,
  effect: (action, listenerApi) => {
    console.log('Message read status updated via WebSocket:', action.payload);
  },
});

export default listenerMiddleware;
