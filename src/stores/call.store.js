import {create} from 'zustand';
import handleAgoraTokenSlice from "./callSlices/agoraTokenSlice.js";

//remote user Slice;
const handleRemoteUser = (set)=>({
  otherUserId: null,
  addOtherUserId: (otherUserId) => {
    set({otherUserId});
  }
  });


const usecallStore = create(set => ({
...handleRemoteUser(set),
...handleAgoraTokenSlice(set),
}));



export default usecallStore;
 