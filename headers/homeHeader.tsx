import React, {FC, useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {ProfileScreenNavigationProp} from '../navigation';

import Icon from 'react-native-vector-icons/Ionicons';
import WorldPicker from '../utils/components/worldPicker';
import {useCurrentUser, WorldHeader} from '../utils/store';
import Settings from './settings';

interface HeaderProps {
  worlds: WorldHeader[];
  onCreateWorld: (name: string) => Promise<boolean>;
  onDeleteWorld: (world: WorldHeader) => Promise<boolean>;
}

const HomeHeader: FC<HeaderProps> = ({
  worlds,
  onCreateWorld,
  onDeleteWorld,
}) => {
  const setCurrentWorld = useCurrentUser(state => state.setWorldRef);
  const onSelectWorldRef = useCallback(
    (world: WorldHeader) => {
      setCurrentWorld(world.refData);
    },
    [setCurrentWorld],
  );

  const [showSettings, setShowSettings] = useState<boolean>(false);

  const navigation = useNavigation<ProfileScreenNavigationProp>();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <WorldPicker
          data={worlds}
          onSelect={onSelectWorldRef}
          onCreateNewWorld={onCreateWorld}
          onDeleteWorld={onDeleteWorld}
        />
        <Icon
          onPress={() => {
            setShowSettings(!showSettings);
          }}
          name="settings-outline"
          size={35}
          color="#555555"
          style={styles.iconButton}
        />
        <Icon
          onPress={() => navigation.navigate('Login')}
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
