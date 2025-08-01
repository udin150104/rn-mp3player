import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MarqueeText from '../MarqueeText';

interface SongListProps {
  loading: boolean;
  files: string[];
  onDelete?: (filePath: string) => void;
  onPlay?: (filePath: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  nowPlaying?: string | null;
  paused?: boolean;
  onRescan?: () => void;
  isRescanning?: boolean;
  onStopAll?: () => void;
}

const SongList = ({
  loading,
  files,
  onDelete,
  onPlay,
  onPause,
  onResume,
  onStop,
  nowPlaying,
  paused,
  onRescan,
  isRescanning,
  onStopAll,
}: SongListProps) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isRescanning) {
      onStopAll?.();
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [isRescanning]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePlay = async (file: string, index: number) => {
    if (file !== nowPlaying) {
      setLoadingIndex(index);
      await onPlay?.(file);
      setLoadingIndex(null);
    }
  };

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Daftar Lagu {files.length}</Text>
        <Pressable
          onPress={onRescan}
          style={styles.rescanButton}
          disabled={isRescanning}
        >
          {isRescanning ? (
            <Animated.View style={{ transform: [{ rotate: spin }] }} key="spin">
              <Ionicons name="refresh-circle-outline" size={18} color="#aaa" />
            </Animated.View>
          ) : (
            <Ionicons name="refresh" size={18} color="#111111ff" />
          )}
          <Text style={[styles.rescanText, isRescanning && { color: '#aaa' }]}>
            {isRescanning ? 'Memindai...' : 'Scan Ulang'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {loading ? (
          <Text style={styles.loading}>🔍 Memuat lagu .mp3...</Text>
        ) : files.length > 0 ? (
          files.map((file, index) => {
            const fileName = file.split('/').pop() || 'Unknown';
            const isPlaying = nowPlaying === file;
            const showLoading = loadingIndex === index && !isPlaying;

            return (
              <View key={index} style={styles.songItem}>
                <Text style={{fontSize:10,color:'#7a7a7aff'}}> {index+1}</Text>
                {/* Play/Pause/Resume Button */}
                <Pressable
                  onPress={() => {
                    if (isPlaying) {
                      paused ? onResume?.() : onPause?.();
                    } else {
                      handlePlay(file, index);
                    }
                  }}
                  style={styles.iconButton}
                  disabled={showLoading}
                >
                  {showLoading ? (
                    <Ionicons name="time-outline" size={35} color="#7a7a7aff" />
                  ) : (
                    <Ionicons
                      name={
                        isPlaying
                          ? paused
                            ? 'play-circle-outline'
                            : 'pause-circle-outline'
                          : 'play-circle-outline'
                      }
                      size={35}
                      color={isPlaying ? '#c5032dff' : '#7a7a7aff'}
                    />
                  )}
                </Pressable>

                {/* Album Art / Cover */}
                <Image
                  source={require('./../../assets/cover.png')}
                  style={styles.cover}
                  resizeMode="cover"
                />

                {/* File Info */}
                <View style={styles.info}>
                  {isPlaying ? (
                    <MarqueeText text={fileName} />
                  ) : (
                    <Text style={styles.songName} numberOfLines={1}>
                      {fileName} 
                    </Text>
                  )}
                  {isPlaying && (
                    <View style={styles.playingIndicator}>
                      <Ionicons
                        name={paused ? 'pause-outline' : 'play-outline'}
                        size={10}
                        color="#c5032dff"
                      />
                      <Text style={styles.playingText}>
                        {paused ? 'Jeda' : 'Sedang diputar'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Stop Button */}
                {isPlaying && (
                  <Pressable onPress={onStop} style={styles.iconButton}>
                    <Ionicons name="stop-circle-outline" size={35} color="#c5032dff" />
                  </Pressable>
                )}

                {/* Delete Button */}
                <Pressable
                  onPress={() => onDelete?.(file)}
                  style={styles.iconButton}
                >
                  <Ionicons name="close-outline" size={18} color="#9e9e9e81" />
                </Pressable>
              </View>
            );
          })
        ) : (
          <Text style={styles.loading}>Tidak ada lagu ditemukan.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rescanText: {
    fontSize: 12,
    color: '#111111ff',
  },
  listContainer: {
    paddingBottom: 150,
  },
  loading: {
    fontSize: 14,
    color: '#999',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    gap: 10,
  },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  songName: {
    fontSize: 14,
    color: '#333',
  },
  iconButton: {
    padding: 4,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  playingText: {
    fontSize: 10,
    color: '#c5032dff',
  },
});

export default SongList;
