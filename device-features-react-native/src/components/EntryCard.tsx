import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface EntryCardProps {
  entry: { imageUri: string; address: string; title: string }; 
  onRemove: () => void;
  theme: 'light' | 'dark';
}

export const EntryCard = ({ entry, onRemove, theme }: EntryCardProps) => {
  return (
    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: theme === 'dark' ? '#555' : '#ccc' }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme === 'dark' ? '#fff' : '#000' }}>
        {entry.title}
      </Text>
      
      <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
        {entry.address}
      </Text>
      <Image source={{ uri: entry.imageUri }} style={{ height: 200, width: 300 }} />

      <TouchableOpacity onPress={onRemove} style={styles.solidButton}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  solidButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});