import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddEntryScreen } from './src/screens/AddEntryScreen';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { ThemeProvider } from './src/utils/ThemeContext';

export type RootStackParamList = {
  Home: undefined;
  AddEntry: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fe6000' }}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#fe6000',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddEntry" component={AddEntryScreen} options={{ title: 'Add Post' }} />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;