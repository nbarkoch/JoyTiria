import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, Keyboard, ScrollView, StyleSheet, View} from 'react-native';
import {
  Group,
  Player,
  useCurrentUser,
  useCurrentWorld,
  useDialog,
  useGroupInfo,
  usePendingUsersLayout,
  UserPreview,
} from '../../../utils/store';

import {LayoutProps} from '../types';
import GroupView, {GroupViewRef} from './groupView';
import BottomActions from './bottomActions';
import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
import PendingUsersContainer from './pendingUsersContainer';
import TrashCan, {TrashCanRef} from './trashCan';
import {firebase} from '@react-native-firebase/auth';
import {isUndefined} from 'lodash';

const {height: SCREEN_HEIGHT} = Dimensions.get('screen');

const GroupsScreen = gestureHandlerRootHOC(() => {
  const groups = useCurrentWorld(state => state.currentWorld?.groups);
  const isAdmin = useCurrentWorld(state => state.currentWorld?.isAdmin);
  const setDialog = useDialog(state => state.setDialog);
  const currentWorldRef = useCurrentUser(state => state.user?.currentWorldRef);
  const [keyboardOpen, setKeyboardOpen] = useState<boolean>(false);
  const [trash, setTrash] = useState<boolean>(false);
  const pendingUsers = useCurrentWorld(
    state => state.currentWorld?.pendingUsers,
  );
  const groupsRefs = useRef<(GroupViewRef | null)[]>([]);
  const trashRef = useRef<TrashCanRef | null>(null);
  const pendingUsersLayoutHeight = usePendingUsersLayout(state => state.height);
  const setGroupId = useGroupInfo(state => state.setGroupId);
  const setGroupName = useGroupInfo(state => state.setGroupName);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const findIfInAnyGroup = useCallback(
    (pendingUserLayoutProps: LayoutProps): Group | undefined => {
      if (groups === undefined) {
        return undefined;
      }
      groupsRefs.current.forEach(ref => ref?.measure());

      const index = groupsRefs.current.findIndex(ref =>
        ref?.isIn(pendingUserLayoutProps),
      );
      return groups[index];
    },
    [groups],
  );

  const findIfInTrashCan = useCallback(
    (pendingUserLayoutProps: LayoutProps): boolean => {
      trashRef.current?.measure();
      const isInTrash = trashRef.current?.isIn(pendingUserLayoutProps);
      return isInTrash ?? false;
    },
    [],
  );

  const deletePendingUser = useCallback(
    async (player: Player) => {
      const userPreview = (await player.docRef.get()).data() as UserPreview;
      const currentPreviewWorld = userPreview.worlds?.find(
        world => world.bigData.id === currentWorldRef?.id,
      );
      if (!isUndefined(currentPreviewWorld)) {
        currentWorldRef?.update({
          pendingUsers: firebase.firestore.FieldValue.arrayRemove(player),
        });
        player.docRef.update({
          worlds:
            firebase.firestore.FieldValue.arrayRemove(currentPreviewWorld),
        });
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    },
    [currentWorldRef],
  );

  const deleteGroup = useCallback(
    (group: Group) => {
      if (
        groups &&
        currentWorldRef &&
        pendingUsers &&
        groups.findIndex(g => g === group) >= 0
      ) {
        const $deleteGroup = () => {
          const i = groups.findIndex(g => g === group);
          const groupPlayers = group.players;
          if (i >= 0) {
            const groupsNew = [...groups];
            groupsNew.splice(i, 1);
            currentWorldRef.update({
              groups: groupsNew,
              pendingUsers: pendingUsers.concat(groupPlayers),
            });
          }
        };
        if (group.players.length > 0) {
          setDialog({
            title: 'Are you sure?',
            message:
              'Are you sure you want to delete this group?\nAll players will lose the group reference',
            onSubmit: $deleteGroup,
          });
        } else {
          $deleteGroup();
        }
      }
    },
    [groups, currentWorldRef, pendingUsers, setDialog],
  );

  const addUserToGroup = useCallback(
    (player: Player, group: Group): void => {
      if (groups && pendingUsers && currentWorldRef) {
        const i = groups.findIndex(g => g === group);
        const j = pendingUsers.findIndex(p => p === player);
        if (i >= 0 && j >= 0 && !groups[i].players.find(p => p === player)) {
          const newGroups = [...groups];
          const pendingUsersNew = [...pendingUsers];

          newGroups[i].players.push(player);
          pendingUsersNew.splice(j, 1);
          currentWorldRef.update({
            groups: newGroups,
            pendingUsers: pendingUsersNew,
          });
        }
      }
    },
    [currentWorldRef, groups, pendingUsers],
  );

  if (groups === undefined) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.tabContainer]}
        style={{maxHeight: SCREEN_HEIGHT - 100 - pendingUsersLayoutHeight}}>
        <View style={styles.groupsContainer}>
          {groups.map((group, index) => (
            <GroupView
              ref={el => {
                groupsRefs.current[index] = el;
              }}
              key={group.name + index.toString()}
              {...group}
              {...(isAdmin
                ? {onLongPress: () => deleteGroup(groups[index])}
                : {})}
              onPress={() => {
                setGroupId(group.id);
                setGroupName(group.name);
              }}
            />
          ))}
        </View>
      </ScrollView>
      {isAdmin && (
        <View pointerEvents={'box-none'} style={styles.bottomContainer}>
          <BottomActions />
          {trash && <TrashCan ref={trashRef} />}
          <Line />
          {!keyboardOpen &&
            pendingUsers !== undefined &&
            pendingUsers.length > 0 && (
              <PendingUsersContainer
                pendingUsers={pendingUsers}
                findIfInAnyGroup={findIfInAnyGroup}
                addUserToGroup={addUserToGroup}
                onDragStart={() => setTrash(true)}
                onDragEnd={() => setTrash(false)}
                findIfInTrashCan={findIfInTrashCan}
                deletePendingUser={deletePendingUser}
              />
            )}
        </View>
      )}
    </View>
  );
});

const Line = () => <View style={styles.line} />;

export default GroupsScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#405C93'},
  tabContainer: {
    flexGrow: 0,
    alignSelf: 'baseline',
    marginBottom: 20,
    width: '100%',
    paddingBottom: 200,
  },
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 380,
    alignSelf: 'center',
    justifyContent: 'center',
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },

  line: {marginTop: 5},
});
