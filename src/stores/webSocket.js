// import { create } from 'zustand';
// import { io as SocketIOClient } from 'socket.io-client'; 
// import { BASE_URI_websocket } from '../Api/ApiManager.js';
// import userStoreAction from './user.store.js'; 

// const useWebSocketStore = create((set, get) => ({
//   webSocket: null,

//   createWebSocket: async () => {
//     try {
//       const { user, localTokens } = userStoreAction.getState();
//       const callerId = user.mobile; 
//       const token = localTokens?.accessToken;
      
//       const socket = SocketIOClient(BASE_URI_websocket, {
//         transports: ['websocket'],
//         query: { callerId },
//         extraHeaders: {
//           Authorization: `Bearer ${token}` 
//         }
//       });

//       socket.on('connect', () => {
//         console.log('WebSocket connected');
//       });

//       socket.on('disconnect', () => {
//         console.log('WebSocket disconnected');
//       });

//       socket.on('connect_error', async (error) => {
//         console.error('WebSocket connection error:', error);
//         const newTokens = await userStoreAction.getState().refreshTokens();
//         if (newTokens) {
//           socket.io.opts.extraHeaders.Authorization = `Bearer ${newTokens.accessToken}`;
//           socket.connect();
//         }
//       });

//       set({ webSocket: socket });
//     } catch (error) {
//       console.error('Error creating WebSocket:', error);
//     }
//   },

//   closeWebSocket: () => {
//     const socket = get().webSocket;
//     if (socket) {
//       socket.disconnect();
//       set({ webSocket: null });
//     }
//   },
// }));

// export default useWebSocketStore;

