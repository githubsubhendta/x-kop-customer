import { useState, useCallback } from "react";
import { appAxios } from "./apiInterceptors.js";
import { BASE_URI } from "./ApiManager.js";
import useChatStore from "../stores/chat.store.js";

export const getAllConversations = async (conversationId, page=1) => {
  try {
    const apiRes = await appAxios.get(`${BASE_URI}/chats/get?conversationId=${conversationId}&page=${page}&limit=10`);
    return apiRes.data.data;
  } catch (error) {
    return [];
  }
};

export const uploadFileForChat = async (formData) =>{
  try {
    const apiRes = await appAxios.post("/chats/uploadChat",formData);
    return apiRes.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}


 
export const usePaginatedChats = (conversationId) => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const { setConversations, conversations } = useChatStore();



  const updateChatStore = useCallback((conversationId, newMessages) => {
    const updatedConversations = conversations.map((convo) => {
      if (convo.conversationId === conversationId) {
        const existingMessageIds = new Set(convo.messages.map((msg) => msg._id));
        const uniqueNewMessages = newMessages.filter((msg) => !existingMessageIds.has(msg._id));
        const allMessages = [...convo.messages, ...uniqueNewMessages];
        return {
          ...convo,
          messages: allMessages,
        };
      }
      return convo;
    });

    if (!updatedConversations.find(convo => convo.conversationId === conversationId)) {
      updatedConversations.push({ conversationId, messages: newMessages });
    }

    setConversations(updatedConversations);
  }, [conversations,setConversations]);

  const loadMoreChats = useCallback(async () => {
    if (loading || !hasMoreChats) return;
    setLoading(true);
    try {
      const data = await getAllConversations(conversationId, page);
      
      if (data && data.messages.length > 0) {
        updateChatStore(conversationId, data.messages);
        setPage((prevPage) => prevPage + 1);
      } else {
        setHasMoreChats(false); 
      }
    } catch (error) {
      console.error('Error loading more chats:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMoreChats, page, conversationId, updateChatStore]);

  return { loadMoreChats, loading, hasMoreChats };
};


