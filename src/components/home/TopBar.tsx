import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

interface TabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabBar = ({ activeTab, setActiveTab }: TabBarProps) => (
  <View style={styles.container}>
    <Pressable onPress={() => setActiveTab('Lagu')} style={styles.row}>
      <Ionicons
        name="musical-note-outline"
        size={18}
        color={activeTab === 'Lagu' ? '#1a1a1aff' : '#bdbdbdff'}
      />
      <Text style={[styles.text, { color: activeTab === 'Lagu' ? '#1a1a1aff' : '#bdbdbdff' }]}>
        Lagu
      </Text>
    </Pressable>

    <Pressable onPress={() => setActiveTab('Playlists')} style={styles.row}>
      <Entypo
        name="folder-music"
        size={18}
        color={activeTab === 'Playlists' ? '#1a1a1aff' : '#bdbdbdff'}
      />
      <Text style={[styles.text, { color: activeTab === 'Playlists' ? '#1a1a1aff' : '#bdbdbdff' }]}>
        Playlist
      </Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e4e4e4ff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  text: {
    fontSize: 16,
  },
});

export default TabBar;
