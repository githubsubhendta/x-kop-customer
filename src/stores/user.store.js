import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {refreshToken as apiRefreshToken} from '../Api/user.api.js';

const useUserStore = create((set, get) => ({
  isLoggedIn: false,
  user: {},
  localTokens: null,
  whatwedoStatus: null,
  onboardStatus: null,

  addLoggedInUserAction: async (user, isLoggedIn = false, tokens = null) => {
    if (tokens) {
      await AsyncStorage.setItem('Authorized_data', JSON.stringify(tokens));
      set({user, isLoggedIn, localTokens: tokens});
    } else {
      set({user, isLoggedIn});
    }
  },

  handleUpdateUser:  (user)=>{
    set({user});
  },

  handlewhatwedoAction: whatwedoStatus => {
    set({whatwedoStatus});
  },

  addOnboardStatus: onboardStatus => {
    set({onboardStatus});
  },

  addLocalTokens: async localTokenData => {
    await AsyncStorage.setItem(
      'Authorized_data',
      JSON.stringify(localTokenData),
    );
    set({localTokens: localTokenData});
  },

  refreshTokens: async () => {
    try {
      const {localTokens} = get();
      if (localTokens && localTokens.refreshToken) {
        const response = await apiRefreshToken({
          refreshToken: localTokens.refreshToken,
        });
        const newTokens = {
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
        };
        await AsyncStorage.setItem(
          'Authorized_data',
          JSON.stringify(newTokens),
        );
        set({localTokens: newTokens});
        return newTokens;
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      set({localTokens: null, isLoggedIn: false});
      await AsyncStorage.removeItem('Authorized_data');
    }
  },
}));

export default useUserStore;
