import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { Slider } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { debounce } from 'lodash';
import { useMusicPlayer } from '../context/MusicPlayerContext';


const MusicScreen = () => {
  const {
    currentFile,
    playlist,
    isPlaying,
    paused,
    position,
    duration,
    playAtIndex,
    seekTo,
    stop,
    resume,
    pause,
    nowPlayingIndex,
  } = useMusicPlayer();

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const isRotating = useRef(false);
  const [previewPosition, setPreviewPosition] = useState<number | null>(null);
  const isSeeking = useRef(false);

  const debouncedSeek = useRef(
    debounce((val: number) => {
      seekTo(val);
    }, 200)
  ).current;

  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  const rotate = () => {
    rotateAnim.setValue(0);
    isRotating.current = true;
    const spin = () => {
      if (!isRotating.current) return;
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && isRotating.current) {
          rotateAnim.setValue(0);
          spin();
        }
      });
    };
    spin();
  };

  const stopRotation = () => {
    isRotating.current = false;
    rotateAnim.stopAnimation(() => {
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });
  };

  useEffect(() => {
    if (isPlaying && !paused) {
      rotate();
    } else {
      stopRotation();
    }
  }, [isPlaying, paused]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getPrevTitle = () => {
    if (!playlist?.length || nowPlayingIndex === -1) return null;
    const prevIndex = nowPlayingIndex === 0 ? playlist.length - 1 : nowPlayingIndex - 1;
    return playlist[prevIndex]?.split('/').pop();
  };

  const getNextTitle = () => {
    if (!playlist?.length || nowPlayingIndex === -1) return null;
    const nextIndex = nowPlayingIndex === playlist.length - 1 ? 0 : nowPlayingIndex + 1;
    return playlist[nextIndex]?.split('/').pop();
  };

  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
  };

  const handleNext = () => {
    if (!playlist?.length || nowPlayingIndex === -1) return;
    const nextIndex = nowPlayingIndex === playlist.length - 1 ? 0 : nowPlayingIndex + 1;
    playAtIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (!playlist?.length || nowPlayingIndex === -1) return;
    const prevIndex = nowPlayingIndex === 0 ? playlist.length - 1 : nowPlayingIndex - 1;
    playAtIndex(prevIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.coverWrapper}>
        <Animated.Image
          source={require('../assets/cover.png')}
          style={[styles.cover, rotateStyle]}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.nowPlaying}>
        {/* {console.log(currentFile)} */}
        {currentFile ? currentFile.split('/').pop() : 'Tidak ada lagu diputar'}
      </Text>

      <View style={styles.sliderContainer}>
        <Text style={{ color: '#8b8b8bff' }}>{formatTime(previewPosition ?? position)}</Text>
        <Slider
          value={previewPosition ?? position}
          minimumValue={0}
          maximumValue={duration > 0 ? duration : 1}
          onValueChange={(val) => {
            isSeeking.current = true;
            setPreviewPosition(val);
          }}
          onSlidingComplete={(val) => {
            if (!isNaN(val) && duration > 0) {
              setPreviewPosition(val);
              debouncedSeek(val);
              setTimeout(() => {
                isSeeking.current = false;
                setPreviewPosition(null);
              }, 500);
            }
          }}
          thumbTintColor="#c5032d"
          minimumTrackTintColor="#c5032d"
          maximumTrackTintColor="#ccc"
          style={{ flex: 1, height: 30 }}
          thumbStyle={{ height: 15, width: 15 }}
        />
        <Text style={{ color: '#8b8b8bff' }}>{duration > 0 ? formatTime(duration) : '00:00'}</Text>
      </View>

      {currentFile ? (
        <View style={styles.trackInfo}>
          <Pressable style={styles.trackItem} onPress={handlePrevious}>
            <Ionicons name="play-skip-back-outline" size={18} color="#888" />
            <Text style={styles.trackText}>{truncate(getPrevTitle() ?? '-', 40)}</Text>
          </Pressable>
          <Pressable style={styles.trackItem} onPress={handleNext}>
            <Ionicons name="play-skip-forward-outline" size={18} color="#888" />
            <Text style={styles.trackText}>{truncate(getNextTitle() ?? '-', 40)}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.controls}>
        <Pressable onPress={handlePrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back-outline" size={30} color="#8b8b8bff" />
        </Pressable>

        {isPlaying ? (
          paused ? (
            <Pressable onPress={resume} style={styles.controlButton}>
              <Ionicons name="play-circle-outline" size={60} color="#c5032d" />
            </Pressable>
          ) : (
            <Pressable onPress={pause} style={styles.controlButton}>
              <Ionicons name="pause-circle-outline" size={60} color="#c5032d" />
            </Pressable>
          )
        ) : (
          <Pressable
            onPress={() => {
              if (nowPlayingIndex >= 0) {
                playAtIndex(nowPlayingIndex);
              } else if (playlist.length > 0) {
                playAtIndex(0);
              }
            }}
            style={styles.controlButton}
          >
            <Ionicons name="play-circle-outline" size={60} color="#c5032d" />
          </Pressable>
        )}

        <Pressable onPress={handleNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward-outline" size={30} color="#8b8b8bff" />
        </Pressable>

        <Pressable onPress={stop} style={styles.controlButton}>
          <Ionicons
            name="stop-circle-outline"
            size={35}
            color={isPlaying ? '#c5032d' : '#666'}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, marginTop: 40, flex: 1, justifyContent: 'center' },
  nowPlaying: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
    color: '#464646ff',
  },
  coverWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cover: {
    width: 250,
    height: 250,
    borderRadius: 500,
    backgroundColor: '#eee',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
    gap: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 22,
  },
  controlButton: {
    padding: 10,
  },
  trackInfo: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    elevation: 0,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  trackText: {
    fontSize: 13,
    color: '#8b8b8bff',
    marginLeft: 8,
    flexShrink: 1,
  },
});

export default MusicScreen;