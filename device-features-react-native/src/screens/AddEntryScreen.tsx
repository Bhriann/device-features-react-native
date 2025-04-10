import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, Alert, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const AddEntryScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('Getting location...');
  const [title, setTitle] = useState<string>('');
  const [isLocationReady, setIsLocationReady] = useState<boolean>(false);

  const isUploadDisabled = !(imageUri && isLocationReady);

  useEffect(() => {
    registerForPushNotificationsAsync();
    requestLocationPermission();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      console.log('Must use a physical device for push notifications');
      return;
    }

    const { granted: existingPermission } = await Notifications.getPermissionsAsync();
    let finalPermission = existingPermission;

    if (!existingPermission) {
      const { granted: newPermission } = await Notifications.requestPermissionsAsync();
      finalPermission = newPermission;
    }

    if (!finalPermission) {
      console.log('Failed to get push token for push notifications!');
      return;
    }

    if (!Constants.expoConfig?.extra?.eas?.projectId) {
      console.log('Project ID not found in Expo config.');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    })).data;

    console.log('Expo Push Token:', token);
    return token;
  }

  const sendNotification = async () => {
    // Check if title is empty, use address instead
    const notificationBody = title 
      ? `Your post "${title}" has successfully been uploaded!` 
      : `Your post from ${address} has successfully been uploaded!`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Post!',
        body: notificationBody,
      },
      trigger: null,
    });
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'You need location access to save your location');
      setAddress('Location permission denied');
    }
  };

  const getAddressFromLocation = async (latitude: number, longitude: number) => {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (address.length > 0) {
        const formattedAddress = `${address[0].city}, ${address[0].region}, ${address[0].country}`;
        setAddress(formattedAddress);
        setIsLocationReady(true);
      }
    } catch (error) {
      console.error("Error getting address:", error);
      setAddress('Could not get address');
      setIsLocationReady(false);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission denied', 'You need to grant camera permission');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0].uri;
      setImageUri(selected);
      
      try {
        const location = await Location.getCurrentPositionAsync({});
        await getAddressFromLocation(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error("Error getting location:", error);
        setAddress('Could not get location');
        setIsLocationReady(false);
      }
    }
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission denied', 'You need to grant image picker permission');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0].uri;
      setImageUri(selected);
      
      try {
        const location = await Location.getCurrentPositionAsync({});
        await getAddressFromLocation(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error("Error getting location:", error);
        setAddress('Could not get location');
        setIsLocationReady(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (isUploadDisabled) return;

    const newEntry = { 
      title, 
      imageUri, 
      address,
      date: new Date().toLocaleDateString('en-US') 
    };
    
    const storedEntries = await AsyncStorage.getItem('entries');
    const entries = storedEntries ? JSON.parse(storedEntries) : [];
    entries.unshift(newEntry);
    await AsyncStorage.setItem('entries', JSON.stringify(entries));

    await sendNotification();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.themeToggleContainer}>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ccc', true: '#007bff' }}
            thumbColor={Platform.OS === 'android' ? (isDarkMode ? '#fff' : '#fff') : ''}
          />
          <Text style={{ color: isDarkMode ? '#fff' : '#000', marginLeft: 10 }}>
            {isDarkMode ? <Ionicons name="moon" size={24} color="#fff" /> : <Ionicons name="sunny" size={24} color="#000" />}
          </Text>
        </View>

        <Text style={[styles.addressText, { color: isDarkMode ? '#fff' : '#000' }]}>
          {address}
        </Text>

        <TextInput
          placeholder="Enter title (optional)"
          placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
          style={[styles.input, { 
            backgroundColor: isDarkMode ? '#555' : '#ddd', 
            color: isDarkMode ? '#fff' : '#000' 
          }]}
          onChangeText={setTitle}
          value={title}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#fe6000' }]} 
            onPress={handleTakePhoto}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#fe6000' }]} 
            onPress={handlePickImage}
          >
            <Text style={styles.buttonText}>Select Photo</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="contain"
          />
        )}

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { 
              backgroundColor: isUploadDisabled ? '#cccccc' : 'green',
              opacity: isUploadDisabled ? 0.6 : 1
            }
          ]} 
          onPress={handleSubmit}
          disabled={isUploadDisabled}
        >
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    marginBottom: 20,
    width: '100%', 
  },
  addressText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
});

export default AddEntryScreen;