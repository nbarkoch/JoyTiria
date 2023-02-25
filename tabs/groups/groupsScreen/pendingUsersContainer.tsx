import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Group, Player, usePendingUsersLayout} from '../../../utils/store';
import PendingUser from './pendingUser';
import {LayoutProps} from '../types';
import {useTranslate} from '../../../languages/translations';

interface PendingUsersContainerProps {
  pendingUsers: Player[];
  findIfInAnyGroup: (pendingUserLayoutProps: LayoutProps) => Group | undefined;
  addUserToGroup: (player: Player, group: Group) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  findIfInTrashCan: (pendingUserLayoutProps: LayoutProps) => boolean;
  deletePendingUser: (player: Player) => Promise<boolean>;
}

const PendingUsersContainer = ({
  pendingUsers,
  findIfInAnyGroup,
  addUserToGroup,
  onDragStart = () => {},
  onDragEnd = () => {},
  findIfInTrashCan,
  deletePendingUser,
}: PendingUsersContainerProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const notifyLayoutHeight = usePendingUsersLayout(state => state.setHeight);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const {t} = useTranslate();

  const $onDragStart = () => {
    setIsBusy(true);
    onDragStart();
  };

  const $onDragEnd = () => {
    setIsBusy(false);
    onDragEnd();
  };

  return (
    <View
      style={styles.pendingUsersBaseContainer}
      onLayout={event => {
        notifyLayoutHeight(event.nativeEvent.layout.height);
      }}>
      <TouchableOpacity
        style={styles.pendingUsersTitleContainer}
        onPress={() => {
          setOpen(!open);
        }}>
        <Text style={styles.pendingUsersTitle}>
          {t('GROUPS.PENDING_USERS')}
        </Text>
      </TouchableOpacity>
      {open && (
        <View
          pointerEvents={isBusy ? 'none' : 'auto'}
          style={[styles.pendingUsersContainer]}>
          {pendingUsers.map(player => (
            <PendingUser
              key={player.docRef.id}
              player={player}
              findIfInAnyGroup={findIfInAnyGroup}
              addUserToGroup={addUserToGroup}
              onDragStart={$onDragStart}
              findIfInTrashCan={findIfInTrashCan}
              deletePendingUser={deletePendingUser}
              onDragEnd={$onDragEnd}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default PendingUsersContainer;

const styles = StyleSheet.create({
  pendingUsersBaseContainer: {
    backgroundColor: '#eeef',
    paddingHorizontal: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  pendingUsersTitleContainer: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#aaaf',
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: 'white',
    marginVertical: 10,
    marginHorizontal: 5,
  },
  pendingUsersTitle: {
    color: 'black',
    fontWeight: 'bold',
  },
  pendingUsersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
