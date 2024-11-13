import { useState } from "react";
import { appAxios } from "./apiInterceptors.js";
import { BASE_URI } from "./ApiManager.js";

export const getAllSchedules = async (page=1) => {
  try {
    const apiRes = await appAxios.get(`${BASE_URI}/chats/conversations`);
    return apiRes.data.data;
  } catch (error) {
    throw error;
  }
};


export const useConversationList = () => {
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState(null);
    const [conversationList, setConversationList] = useState([]);

    const getAllConversationList = async ()=>{
        setLoading(true);
             try {
                const data = await getAllSchedules();
                setConversationList(data);
             } catch (error) {
                setError(error.response) 
             } finally{
                setLoading(false);
             }
    }

    return {loading,error,conversationList,getAllConversationList}

}