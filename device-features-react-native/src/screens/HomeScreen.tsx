import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, View, TouchableOpacity, TextInput, Image, Switch, Platform, StyleSheet, Alert, ScrollView, Keyboard } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface Entry {
  title: string;
  imageUri: string;
  address: string;
  date: string;
}

let usernameTimeout: ReturnType<typeof setTimeout>;

export const HomeScreen = ({ navigation }: Props) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [username, setUsername] = useState<string>('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [showUsernameInput, setShowUsernameInput] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      const storedEntries = await AsyncStorage.getItem('entries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }

      const storedName = await AsyncStorage.getItem('username');
      if (storedName) {
        setUsername(storedName);
        setShowUsernameInput(false);
      } else {
        setShowUsernameInput(true);
      }

      const storedPic = await AsyncStorage.getItem('profilePic');
      if (storedPic) setProfilePic(storedPic);
    };

    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const removeEntry = async (index: number) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
    await AsyncStorage.setItem('entries', JSON.stringify(updatedEntries));
  };

  const handleEntryOptions = (index: number) => {
    Alert.alert(
      "Post Options",
      "What would you like to do with this post?",
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeEntry(index)
        },
        {
          text: "Rename",
          onPress: () => renameEntry(index)
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const renameEntry = async (index: number) => {
    Alert.prompt(
      "Rename Post",
      "Enter new title:",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async (newTitle) => {
            const updatedEntries = [...entries];
            updatedEntries[index].title = newTitle?.trim() || '';
            setEntries(updatedEntries);
            await AsyncStorage.setItem('entries', JSON.stringify(updatedEntries));
          }
        }
      ],
      'plain-text',
      entries[index].title
    );
  };
 
  const handleProfilePic = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      aspect: [1, 1],
      allowsEditing: true,
    });


    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0].uri;
      setProfilePic(selected);
      await AsyncStorage.setItem('profilePic', selected);
    }
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (usernameTimeout) clearTimeout(usernameTimeout);

    usernameTimeout = setTimeout(async () => {
      await AsyncStorage.setItem('username', text.trim());
    }, 1000);
  };

  const handleUsernameSubmit = () => {
    if (username.trim().length > 0) {
      AsyncStorage.setItem('username', username.trim());
      setShowUsernameInput(false);
      Keyboard.dismiss();
    }
  };

  const handleUsernamePress = () => {
    setShowUsernameInput(true);
  };

  const handleProfilePicPress = () => {
    if (profilePic) {
      Alert.alert(
        "Profile Picture",
        "Do you want to replace or remove your profile picture?",
        [
          {
            text: "Replace",
            onPress: () => showReplaceOptions()
          },
          {
            text: "Remove",
            onPress: async () => {
              setProfilePic(null);
              await AsyncStorage.removeItem('profilePic');
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else {
      showReplaceOptions();
    }
  };
  
  const showReplaceOptions = () => {
    Alert.alert(
      "Choose Option",
      "How would you like to set your profile picture?",
      [
        {
          text: "Take Photo",
          onPress: () => handleTakePhoto()
        },
        {
          text: "Choose from Library",
          onPress: handleProfilePic
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };
  
  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
  
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      aspect: [1, 1],
      allowsEditing: true,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0].uri;
      setProfilePic(selected);
      await AsyncStorage.setItem('profilePic', selected);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>


        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleProfilePicPress}>
            {profilePic ? (
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: profilePic }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    marginBottom: 10,
                    borderWidth: 3,
                    borderColor: '#fe6000',
                  }}
                />
              </View>
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: '#ccc',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: '#555' }}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>


          {showUsernameInput || !username ? (
            <TextInput
              style={{
                backgroundColor: isDarkMode ? '#555' : '#ddd',
                color: isDarkMode ? '#fff' : '#000',
                padding: 10,
                width: '70%',
                borderRadius: 8,
                marginBottom: 10,
                textAlign: 'center',
              }}
              placeholder="Enter your name"
              placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
              value={username}
              onChangeText={handleUsernameChange}
              autoFocus={false}
              returnKeyType="done"
              onSubmitEditing={handleUsernameSubmit}
              blurOnSubmit={true}
            />
          ) : (
            <TouchableOpacity onPress={handleUsernamePress}>
              <Text style={{
                fontWeight: 'bold',
                fontSize: 20,
                color: isDarkMode ? '#fff' : '#000',
                marginBottom: 10,
                textAlign: 'center',
                padding: 10,
              }}>
                {username}
              </Text>
            </TouchableOpacity>
          )}


          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
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
        </View>


        {/* Posts Section */}
        {entries.length === 0 ? (
          <View style={styles.centeredContent}>
            <Text style={{ color: isDarkMode ? '#fff' : '#000', marginBottom: 20 }}>No Posts yet!</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddEntry')}
              style={styles.addButton}
            >
              <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.postsContainer}>
            {entries.map((item, index) => (
              <View
                key={index.toString()}
                style={[
                  styles.entryContainer,
                  !item.title && styles.entryContainerNoTitle
                ]}
              >
                {item.title ? (
                  <View style={styles.entryHeader}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: isDarkMode ? '#fff' : '#000' }}>
                      {item.title}
                    </Text>
                    <TouchableOpacity onPress={() => handleEntryOptions(index)}>
                      <Ionicons name="ellipsis-horizontal-circle" size={45} color={isDarkMode ? '#fff' : '#000'} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.entryHeaderNoTitle}>
                    <TouchableOpacity onPress={() => handleEntryOptions(index)}>
                      <Ionicons name="ellipsis-horizontal-circle" size={45} color={isDarkMode ? '#fff' : '#000'} position={'absolute'} right={0} bottom={-40}/>
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={{ color: isDarkMode ? '#fff' : '#000', marginBottom: 5 }}>
                  <Ionicons name="location-outline" size={11} color={isDarkMode ? '#fff' : '#000'} />
                  {item.address}
                </Text>
                <Text style={{ color: isDarkMode ? '#ccc' : '#888', fontSize: 12, marginBottom: 10 }}>
                  {item.date}
                </Text>
                <Image
                  source={{ uri: item.imageUri }}
                  style={[
                    styles.entryImage,
                    !item.title && styles.entryImageNoTitle
                  ]}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>


      {/* Floating Add Button */}
      {entries.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddEntry')}
          style={styles.addButtonFloating}
        >
          <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -90,
  },
  postsContainer: {
    paddingHorizontal: 15,
  },
  addButton: {
    backgroundColor: '#fe6000',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonFloating: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fe6000',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  entryContainerNoTitle: {
    paddingTop: 5,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  entryHeaderNoTitle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  entryImage: {
    width: '100%',
    height: 300,
  },
  entryImageNoTitle: {
    height: 350,
    marginTop: 5,
  },
});

export default HomeScreen;