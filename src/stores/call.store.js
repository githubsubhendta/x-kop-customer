// import {create} from 'zustand';
// import handleAgoraTokenSlice from "./callSlices/agoraTokenSlice.js";

// //remote user Slice;
// const handleRemoteUser = (set)=>({
//   otherUserId: null,
//   addOtherUserId: (otherUserId) => {
//     set({otherUserId});
//   }
//   });

// const usecallStore = create(set => ({
// ...handleRemoteUser(set),
// ...handleAgoraTokenSlice(set),
// }));

// export default usecallStore;

// import { create } from 'zustand';

// const usecallStore = create(
//     (set) => ({
//       conversations: [],
//       setConversations: (data) => set({ conversations:data }),
//       clearAllChats:()=>set({ conversations:[] })
//     })
// );

// export default usecallStore;

import create from 'zustand';

const useCallStore = create(set => ({
  isMuted: false,
  isSpeakerEnabled: true,
  connectionStatus: 'Not Connected',
  callDuration: '00:00:00',
  peerIds: [],
  callStatus: true, // Whether the call is active or not

  // Actions to update state
  toggleMute: () => set(state => ({isMuted: !state.isMuted})),
  toggleSpeaker: () =>
    set(state => ({isSpeakerEnabled: !state.isSpeakerEnabled})),
  setConnectionStatus: status => set({connectionStatus: status}),
  setCallDuration: duration => set({callDuration: duration}),
  setPeerIds: peerIds => set({peerIds}),
  setCallStatus: status => set({callStatus: status}),
}));

export default useCallStore;
