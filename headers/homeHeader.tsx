import React, {FC, useCallback, useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import {useCurrentUser, WorldHeader} from '../utils/store';
import Settings from './settings';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import WorldPicker from '../utils/components/WorldPicker';

interface HeaderProps {
  worlds: WorldHeader[];
  onCreateWorld: (name: string) => Promise<boolean>;
  onDeleteWorld: (world: WorldHeader) => Promise<boolean>;
  onLogOut: () => void;
}

const HomeHeader: FC<HeaderProps> = ({
  worlds,
  onCreateWorld,
  onDeleteWorld,
  onLogOut,
}) => {
  const setCurrentWorld = useCurrentUser(state => state.setWorldRef);
  const onSelectWorldRef = useCallback(
    (world: WorldHeader) => {
      setCurrentWorld(world.refData);
    },
    [setCurrentWorld],
  );

  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotateZ: `${rotation.value}deg`}],
    };
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    rotation.value = withTiming(showSettings ? 90 : 0);
  });

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <WorldPicker
          data={worlds}
          onSelect={onSelectWorldRef}
          onCreateNewWorld={onCreateWorld}
          onDeleteWorld={onDeleteWorld}
        />
        <TouchableOpacity
          onPress={() => {
            setShowSettings(!showSettings);
          }}>
          <Animated.View style={animatedStyle}>
            <Icon
              name="settings-outline"
              size={35}
              color="#555555"
              style={styles.iconButton}
            />
          </Animated.View>
        </TouchableOpacity>

        <Icon
          onPress={onLogOut}
          name="exit-outline"
          size={35}
          color="#555555"
          style={styles.iconButton}
        />
      </View>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  headerContainer: {
    position: 'absolute',
    width: '100%',
  },
  iconButton: {paddingVertical: 5, paddingHorizontal: 10},
  dropdown: {
    height: 50,
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 22,
    paddingHorizontal: 8,
  },
});

export default HomeHeader;
