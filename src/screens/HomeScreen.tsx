import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, PermissionsAndroid, Platform, Linking } from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TabBar from './../components/home/TopBar';
import SongList from './../components/home/SongList';
import PlaylistsScreen from './../components/home/PlaylistsScreen';
import { useMusicPlayer } from '../context/MusicPlayerContext';

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('Lagu');
  const [mp3Files, setMp3Files] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescanLoading, setRescanLoading] = useState(false);
  const { setPlaylist, playAtIndex, setPlaylistAndPlay, pause, resume, stop, currentFile, paused } = useMusicPlayer();

  useEffect(() => { loadCachedMp3s(); }, []);

  const loadCachedMp3s = async () => {
    try {
      const data = await AsyncStorage.getItem('cachedMp3List');
      if (data) {
        const arr = JSON.parse(data);
        setMp3Files(arr);
        setPlaylist(arr);
        setLoading(false);
      } else scanMp3Files();
    } catch { scanMp3Files(); }
  };

  const scanMp3Files = async () => {
    setRescanLoading(true); setLoading(true);
    const perm = Platform.OS === 'android' ?
      await PermissionsAndroid.request(
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        { title: 'Izin Akses Musik', message: 'Butuh akses ke file musik' }
      ) : PermissionsAndroid.RESULTS.GRANTED;
    if (perm !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Izin ditolak');
      setLoading(false); setRescanLoading(false);
      return;
    }

    const found: string[] = [];
    const walk = async (p: string) => {
      try {
        const files = await RNFS.readDir(p);
        for (const f of files) {
          if (f.isFile() && f.name.endsWith('.mp3')) found.push(f.path);
          else if (f.isDirectory()) await walk(f.path);
        }
      } catch { }
    };

    await walk(RNFS.ExternalStorageDirectoryPath);
    setMp3Files(found);
    setPlaylist(found);
    await AsyncStorage.setItem('cachedMp3List', JSON.stringify(found));
    setLoading(false); setRescanLoading(false);
  };

  const handleDelete = (path: string) => {
    const isCurrent = currentFile === path;
    if (isCurrent) pause();
    Alert.alert('Hapus lagu?', isCurrent ? 'Lagu sedang diputar.' : '', [
      { text: 'Batal', style: 'cancel', onPress: () => isCurrent && resume() },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          if (isCurrent) stop();
          try {
            await RNFS.unlink(path);
            const updated = mp3Files.filter(f => f !== path);
            setMp3Files(updated);
            setPlaylist(updated);
            await AsyncStorage.setItem('cachedMp3List', JSON.stringify(updated));
          } catch {
            Alert.alert('Gagal hapus');
          }
        }
      }
    ]);
  };

  const renderContent = () =>
    activeTab === 'Lagu' ? (
      <SongList
        loading={loading}
        files={mp3Files}
        onRescan={scanMp3Files}
        onPlay={(fp: string) => {
          setPlaylistAndPlay(mp3Files, mp3Files.indexOf(fp));
        }}
        onPause={pause}
        onResume={resume}
        onStop={stop}
        onStopAll={stop}
        nowPlaying={currentFile}
        paused={paused}
        onDelete={handleDelete}
        isRescanning={rescanLoading}
      />

    ) : (<PlaylistsScreen allSongs={mp3Files} />);

  return (
    <View style={styles.container}>
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <View style={styles.contentBox}>{renderContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 30 },
  contentBox: { padding: 10 },
});

export default HomeScreen;
