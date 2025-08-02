import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useMusicPlayer } from './../../context/MusicPlayerContext';

interface Playlist {
  name: string;
  songs: string[];
}

const PlaylistsScreen = ({ allSongs }: { allSongs: string[] }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedPlaylistName, setSelectedPlaylistName] = useState<string | null>(null);
  const [songModalVisible, setSongModalVisible] = useState(false);
  const [playlistSongsModalVisible, setPlaylistSongsModalVisible] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);

  const { playAtIndex, setPlaylist,setPlaylistAndPlay, currentFile } = useMusicPlayer();

  useEffect(() => { loadPlaylists(); }, []);

  const loadPlaylists = async () => {
    const data = await AsyncStorage.getItem('playlists');
    if (data) setPlaylists(JSON.parse(data));
  };

  const savePlaylists = async (updated: Playlist[]) => {
    setPlaylists(updated);
    await AsyncStorage.setItem('playlists', JSON.stringify(updated));
  };

  const confirmDelete = (name: string) => {
    setPendingDeleteName(name);
    setConfirmDeleteVisible(true);
  };

  const deletePlaylist = () => {
    if (!pendingDeleteName) return;
    const updated = playlists.filter((p) => p.name !== pendingDeleteName);
    savePlaylists(updated);
    setConfirmDeleteVisible(false);
    setPendingDeleteName(null);
  };

  const createPlaylist = () => {
    const trimmed = newName.trim();
    if (!trimmed || playlists.some((p) => p.name === trimmed)) return;
    const updated = [...playlists, { name: trimmed, songs: [] }];
    savePlaylists(updated);
    setModalVisible(false);
    setNewName('');
  };

  const addSongPlaylist = (playlistName: string) => {
    const playlist = playlists.find((p) => p.name === playlistName);
    if (!playlist) return;
    const remainingSongs = allSongs.filter((song) => !playlist.songs.includes(song));
    if (remainingSongs.length === 0) return;
    setSelectedPlaylistName(playlistName);
    setSongModalVisible(true);
  };

  const addSongToPlaylist = async (song: string) => {
    if (!selectedPlaylistName) return;
    const updated = playlists.map((p) => {
      if (p.name === selectedPlaylistName && !p.songs.includes(song)) {
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    });
    await savePlaylists(updated);
  };

  const openPlaylistSongsModal = (playlist: Playlist) => {
    setSelectedPlaylistName(playlist.name);
    setSelectedSongs(playlist.songs);
    setPlaylistSongsModalVisible(true);
  };

  const removeSongFromPlaylist = async (song: string) => {
    const updated = playlists.map((p) => {
      if (p.name === selectedPlaylistName) {
        return { ...p, songs: p.songs.filter((s) => s !== song) };
      }
      return p;
    });
    await savePlaylists(updated);
    setSelectedSongs((prev) => prev.filter((s) => s !== song));
  };

  const playSongInPlaylist = (songIndex: number) => {
    const playlist = playlists.find((p) => p.name === selectedPlaylistName);
    // console.log(playlist);
    if (!playlist) return;
    setPlaylist(playlist.songs);
    // playAtIndex(songIndex);
    
    setPlaylistAndPlay(playlist.songs, songIndex);
  };

  const openRenameModal = (playlistName: string) => {
    setSelectedPlaylistName(playlistName);
    setRenameValue(playlistName);
    setRenameModalVisible(true);
  };

  const renamePlaylist = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || playlists.some(p => p.name === trimmed)) return;
    const updated = playlists.map(p => {
      if (p.name === selectedPlaylistName) return { ...p, name: trimmed };
      return p;
    });
    await savePlaylists(updated);
    setRenameModalVisible(false);
    setSelectedPlaylistName(null);
    setRenameValue('');
  };

  const selectedPlaylist = playlists.find((p) => p.name === selectedPlaylistName);
  const filteredSongs = selectedPlaylist
    ? allSongs.filter((song) => !selectedPlaylist.songs.includes(song))
    : [];

  const renderItem = ({ item }: { item: Playlist }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtext}>{item.songs.length} lagu</Text>
      </View>
      <View style={styles.buttonRow}>
        <Pressable onPress={() => addSongPlaylist(item.name)} style={styles.button}>
          <Ionicons name="add-outline" size={28} color="#ffffff" />
        </Pressable>
        <Pressable onPress={() => openPlaylistSongsModal(item)} style={styles.button}>
          <Ionicons name="musical-notes-outline" size={28} color="#ffffff" />
        </Pressable>
        <Pressable onPress={() => openRenameModal(item.name)} style={styles.button}>
          <Ionicons name="create-outline" size={28} color="#ffffff" />
        </Pressable>
        <Pressable onPress={() => confirmDelete(item.name)} style={styles.button}>
          <Ionicons name="trash-outline" size={28} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.buttonx} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>+ Buat Playlist</Text>
        </Pressable>
      </View>

      <FlatList
        data={playlists}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada playlist</Text>}
        contentContainerStyle={{ paddingBottom: 250 }}
      />

      <Modal visible={confirmDeleteVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={[styles.modalTitle, { color: '#949393ff' }]}>Hapus playlist</Text>
            <Text style={[styles.modalTitle, { color: '#c5032d', fontSize:12, marginVertical:20, paddingBottom:20 }]}>Anda yakin ingin hapus playlist {pendingDeleteName}?</Text>
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setConfirmDeleteVisible(false)}>
                <Text style={styles.cancel}>Batal</Text>
              </Pressable>
              <Pressable onPress={deletePlaylist}>
                <Text style={styles.create}>Hapus</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>



      {/* Modal Buat Playlist */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Buat Playlist</Text>
            <TextInput
              placeholder="Nama Playlist"
              value={newName}
              onChangeText={setNewName}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.cancel}>Batal</Text>
              </Pressable>
              <Pressable onPress={createPlaylist}>
                <Text style={styles.create}>Buat</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Rename Playlist */}
      <Modal visible={renameModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={[styles.modalTitle, { color: '#949393ff' }]}>Ganti Nama Playlist</Text>
            <TextInput
              placeholder="Nama Baru"
              value={renameValue}
              onChangeText={setRenameValue}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setRenameModalVisible(false)}>
                <Text style={styles.cancel}>Batal</Text>
              </Pressable>
              <Pressable onPress={renamePlaylist}>
                <Text style={styles.create}>Ganti</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Pilih Lagu */}
      <Modal visible={songModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={[styles.modalTitle, { color: '#949393ff' }]}>Pilih Lagu</Text>
            <FlatList
              data={filteredSongs}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' }}
                  onPress={() => addSongToPlaylist(item)}
                >
                  <Text numberOfLines={1}>{item.split('/').pop()}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#999' }}>Tidak ada lagu tersedia</Text>
              }
              style={{ maxHeight: 300,borderBottomWidth:1, borderBottomColor:'#c4c4c4ff',paddingBottom:20 }}
            />
            <Pressable onPress={() => setSongModalVisible(false)} style={{ marginTop: 10, flexDirection:'row', alignContent:'center',alignItems:'center', alignSelf:'center' }}>
              <Text><Ionicons name="close" size={28} color="#c4c4c4ff" style={{ textAlign: 'center' }} /></Text>
              <Text style={{color:"#c4c4c4ff", fontSize:18}}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Lagu Dalam Playlist */}
      <Modal visible={playlistSongsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={[styles.modalTitle, { color: '#949393ff' }]}>Lagu dalam Playlist</Text>
            <FlatList
              data={selectedSongs}
              keyExtractor={(item) => item}
              renderItem={({ item, index }) => {
                const isPlaying = currentFile === item;
                const iconColor = isPlaying ? '#c5032d' : '#949393ff';

                return (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                    gap: 10
                  }}>
                    <Pressable onPress={() => playSongInPlaylist(index)}>
                      <Ionicons name="play-circle-outline" size={18} color={iconColor} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontWeight: isPlaying ? 'bold' : 'normal', color: isPlaying ? '#c5032d' : '#000' }}>
                        {item.split('/').pop()}
                      </Text>
                    </View>
                    <Pressable onPress={() => removeSongFromPlaylist(item)}>
                      <Ionicons name="trash-outline" size={18} color="#c5032d" />
                    </Pressable>
                  </View>
                );
              }}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#c4c4c4ff' }}>Tidak ada lagu</Text>}
              style={{ maxHeight: 300,borderBottomWidth:1, borderBottomColor:'#c4c4c4ff',paddingBottom:20 }}
            />
            <Pressable onPress={() => setPlaylistSongsModalVisible(false)} style={{ marginTop: 10, flexDirection:'row', alignContent:'center',alignItems:'center', alignSelf:'center' }}>
              <Text><Ionicons name="close" size={28} color="#c4c4c4ff" style={{ textAlign: 'center' }} /></Text>
              <Text style={{color:"#c4c4c4ff", fontSize:18}}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 0, paddingHorizontal: 0 },
  topBar: { marginBottom: 12 },
  buttonx: {
    backgroundColor: '#c5032d',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  item: { backgroundColor: '#fff', padding: 10, marginVertical: 8, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  subtext: { fontSize: 13, color: '#888', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, backgroundColor:'#c5032d', borderRadius:10, paddingHorizontal:10 },
  button: { padding: 8 },
  empty: { textAlign: 'center', marginTop: 30, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '85%', maxHeight: '80%' },
  modalTitle: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancel: { color: '#999', fontWeight: 'bold' },
  create: { color: '#c5032d', fontWeight: 'bold' },
});

export default PlaylistsScreen;
