import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';

interface MarqueeTextProps {
  text: string;
  width?: number;
}

const MarqueeText = ({ text, width = 100 }: MarqueeTextProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: -width,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  return (
    <View style={[stylesMarquee.container]}>
      <Animated.Text
        style={[
          stylesMarquee.text,
          { transform: [{ translateX: animatedValue }] },
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

const stylesMarquee = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  text: {
    color: '#7a7a7aff',
    fontSize: 10,
  },
});

export default MarqueeText;
