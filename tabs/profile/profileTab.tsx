import {isUndefined} from 'lodash';
import React, {FlatList, StyleSheet, View} from 'react-native';
import {Player, useCurrentUser, useCurrentWorld} from '../../utils/store';
import {useCallback, useRef, useState} from 'react';
import BasicPlayerView from './basicPlayerView';
import ProfileHeader from './profileHeader';

function ProfileTab() {
  const user = useCurrentUser(state => state.user);

  const players = useCurrentWorld(state => {
    if (state.currentWorld !== undefined) {
      const $players = state.currentWorld?.groups.map(g => g.players).flat();
      if (state.currentWorld.pendingUsers !== undefined) {
        $players.concat(state.currentWorld.pendingUsers);
      }
      return $players;
    }
  });

  const [highlightedPlayer, setHighlightedPlayer] = useState<
    string | undefined
  >(undefined);
  const numHighlighted = useRef<number>(0);

  const userPlayer = isUndefined(user)
    ? undefined
    : players?.find(p => p.docRef.id === user.ref.id);

  const scrollRef = useRef<FlatList>(null);

  const scrollToPlayer = useCallback(() => {
    if (!isUndefined(scrollRef.current) && !isUndefined(userPlayer)) {
      scrollRef.current?.scrollToItem({item: userPlayer, animated: true});
      numHighlighted.current = 0;
      const interval = setInterval(() => {
        setHighlightedPlayer(
          numHighlighted.current % 2 === 1 ? undefined : userPlayer.docRef.id,
        );
        if (numHighlighted.current > 3) {
          clearInterval(interval);
          setHighlightedPlayer(undefined);
          numHighlighted.current = 0;
        } else {
          numHighlighted.current++;
        }
      }, 300);
    }
  }, [userPlayer]);

  if (players === undefined || user === undefined) {
    return <></>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={scrollRef}
        data={players.sort((a, b) => b.score - a.score)}
        renderItem={({item}: {item: Player}) => {
          return (
            <View style={styles.item}>
              <BasicPlayerView
                isUser={user.ref.id === item.docRef.id}
                {...item}
                highlight={highlightedPlayer === item.docRef.id}
              />
            </View>
          );
        }}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <ProfileHeader
              user={user}
              player={userPlayer}
              jumpToPlayer={scrollToPlayer}
            />
          </View>
        )}
        ListFooterComponent={() => <View style={styles.footer} />}
        keyboardShouldPersistTaps="always"
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#405C93',
  },
  userImage: {
    aspectRatio: 1.5,
  },
  header: {paddingBottom: 3, flex: 1},
  item: {paddingHorizontal: 3},
  footer: {height: 3},
});

export default ProfileTab;
