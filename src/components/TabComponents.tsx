import React from 'react';
import {
  View,
  // Text,
  Platform,
  StyleSheet,
} from 'react-native';
import { useTheme, useLinkBuilder } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';

function TabComponents({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  // console.log(state);

  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const icon =
          options.tabBarIcon?.({
            focused: isFocused,
            color: isFocused ? '#ffffff' : '#bbdefb',
            size: 24,
          }) ?? null;

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            {icon}
            {/* <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
              {label}
            </Text> */}
          </PlatformPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 20,
    paddingTop: 20,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: '#bbdefb',
    marginTop: 4,
  },
  tabLabelFocused: {
    color: '#0c92ffff',
    fontWeight: 'bold',
  },
});

export default TabComponents;
