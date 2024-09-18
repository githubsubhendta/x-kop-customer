import React, { createContext, useState, useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading, showLoading, hideLoading }}>
      {children}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

const styles = {
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};
