import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SVG_X_KOP_LOGO } from '../utils/SVGImage';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <View >
      <SvgXml xml={SVG_X_KOP_LOGO} width={200} height={200} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SplashScreen;
