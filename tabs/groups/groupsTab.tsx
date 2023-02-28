import React, {useCallback, useEffect} from 'react';
import {
  BackHandler,
  I18nManager,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useCurrentWorld,
  useGroupInfo,
  useSelectionPlayerProgress,
} from '../../utils/store';
import GroupInfoScreen from './groupInfoScreen/groupInfoScreen';
import GroupsScreen from './groupsScreen/groupsScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {SlideInRight, SlideOutRight} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {TabsNavigationProp} from '../../navigation';

function GroupsTab() {
  const groupId = useGroupInfo(state => state.groupId);
  const group = useCurrentWorld(state =>
    state.currentWorld?.groups.find(grp => grp.id === groupId),
  );
  const removeGroupId = useGroupInfo(state => state.removeGroupId);
  const removeSelection = useSelectionPlayerProgress(
    state => state.removeSelection,
  );

  useEffect(() => {
    if (group === undefined) {
      removeGroupId();
      removeSelection();
    }
  }, [group, removeGroupId, removeSelection]);

  return (
    <View style={styles.container}>
      <GroupsScreen />
      {group !== undefined ? (
        <Animated.View
          pointerEvents={'box-none'}
          style={styles.transitionContainer}
          entering={SlideInRight}
          exiting={SlideOutRight}>
          <GroupInfoScreen {...group} />
        </Animated.View>
      ) : (
        <View />
      )}
    </View>
  );
}

export const GroupsTabHeaderLeft = () => {
  const groupId = useGroupInfo(state => state.groupId);
  const removeGroupId = useGroupInfo(state => state.removeGroupId);
  const navigation = useNavigation<TabsNavigationProp>();
  const selectedPlayerId = useSelectionPlayerProgress(
    state => state.selectedPlayer,
  );
  const removeSelection = useSelectionPlayerProgress(
    state => state.removeSelection,
  );

  const handleBackButtonClick = useCallback(() => {
    if (
      groupId !== undefined &&
      navigation.getState().routeNames[navigation.getState().index] === 'Groups'
    ) {
      if (selectedPlayerId !== undefined) {
        removeSelection();
      } else {
        removeGroupId();
      }
      return true;
    }
    return false;
  }, [groupId, navigation, removeGroupId, removeSelection, selectedPlayerId]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, [handleBackButtonClick]);

  if (groupId !== undefined) {
    return (
      <TouchableOpacity onPress={handleBackButtonClick}>
        <Icon
          name={'chevron-back'}
          size={30}
          color={'grey'}
          style={[I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : {}]}
        />
      </TouchableOpacity>
    );
  }
  return <></>;
};

export default GroupsTab;

const styles = StyleSheet.create({
  container: {flex: 1},
  transitionContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  gradientStyle: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: -2,
  },
  imageStyle: {
    aspectRatio: 1,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
});
