import AsyncStorage from '@react-native-async-storage/async-storage';

interface Entry {
  imageUri: string;
  address: string;
}

export const saveEntryToStorage = async (newEntry: Entry) => {
  const storedEntries = await AsyncStorage.getItem('entries');
  const entries: Entry[] = storedEntries ? JSON.parse(storedEntries) : [];
  entries.push(newEntry);
  await AsyncStorage.setItem('entries', JSON.stringify(entries));
};

export const getEntriesFromStorage = async (): Promise<Entry[]> => {
  const storedEntries = await AsyncStorage.getItem('entries');
  return storedEntries ? JSON.parse(storedEntries) : [];
};


