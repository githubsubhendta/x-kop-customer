import axios from 'axios';
import { BASE_URI } from '../../Api/ApiManager';

export default handleAgoraTokenSlice = (set)=>({
agoraConfig:{
    token:null,
    uid:0,
    channelName:""
},

handleGenerateToken:async (channelName,accessToken)=>{
 const {data} = await axios.post(BASE_URI+"/token/agora_token", {channelName,uid:0}, {  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  } });
  set({agoraConfig:data.data})
}
});