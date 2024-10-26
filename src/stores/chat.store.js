import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useChatStore = create(
  persist(
    (set) => ({
      conversations: [],
      setConversations: (data) => set({ conversations:data }),
      clearAllChats:()=>set({ conversations:[] })
    }),
    {
      name: 'chat-store',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;  
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value)); 
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);

export default useChatStore;
