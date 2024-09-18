import {create} from 'zustand';

const themeStore = create(set => ({

  themeAppState: null,

  addAppState: (themeAppState) => {
    set({themeAppState});
  }
  
}));

export default themeStore;
