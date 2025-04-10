import React from 'react';
import { SafeAreaView, Text, ActivityIndicator, View, Image, StyleSheet } from 'react-native';

export const LoadingScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContent}>
        <Image
          source={require('../images/Wandr.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.quote}>"Wander Further, Picture Wilder!"</Text>
      </View>
      <ActivityIndicator size="large" color="#fff" style={styles.loader} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fe6000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topContent: {
    alignItems: 'center',
    marginBottom: 50, 
    marginTop: -60,   
  },
  logo: {
    width: 400,
    height: 400,
    marginBottom: -20, 
  },
  quote: {
    fontSize: 16,
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 0,
  },
  loader: {
    marginTop: 20,
  },
});

export default LoadingScreen;