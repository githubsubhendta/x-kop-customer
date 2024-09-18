import React, { createContext, useContext, ReactNode } from 'react';
import Snackbar from 'react-native-snackbar';

const SnackbarContext = createContext(null);

export const SnackbarProvider = ({ children }) => {
  const showSnackbar = (message, type = 'info') => {
    Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: type === 'error' ? 'red' : type === 'success' ? 'green' : 'gray',
      action: {
        text: 'Dismiss',
        textColor: 'white',
        onPress: () => Snackbar.dismiss(),
      },
    });
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
