import {isUndefined} from 'lodash';
import React, {FlatList, StyleSheet, Text, View} from 'react-native';
import {
  ImageType,
  Player,
  useCurrentUser,
  useCurrentWorld,
  useProfile,
  UserPreview,
  WorldPreview,
} from '../../utils/store';
import {useCallback, useEffect, useRef, useState} from 'react';
import BasicPlayerView from './basicPlayerView';
import ProfileHeader from './profileHeader';
import {RouteProp, useRoute} from '@react-navigation/native';
import {TabsStackParamList} from '../../navigation';
import fb from '@react-native-firebase/firestore';

function ProfileTab() {
  const curUserId = useCurrentUser(state => state.user?.ref.id);
  const userIdFromParamRoute =
    useRoute<RouteProp<TabsStackParamList, 'Profile'>>().params.userId;

  const players = useCurrentWorld(state => {
    if (state.currentWorld !== undefined) {
      let $players = state.currentWorld?.groups.map(g => g.players).flat();
      if (state.currentWorld.admins !== undefined) {
        $players = $players.concat(
          state.currentWorld.admins.map(admin => ({
            docRef: admin,
            score: 0,
            pendingScore: undefined,
          })),
        );
      }
      if (state.currentWorld.pendingUsers !== undefined) {
        $players = $players.concat(state.currentWorld.pendingUsers);
      }
      return $players;
    }
    return [];
  });

  const userProfileId = useProfile(state => state.userProfileId);
  const setUserProfileId = useProfile(state => state.setUserProfileId);

  const [userPreview, setUserPreview] = useState<UserPreview | undefined>(
    undefined,
  );

  useEffect(() => {
    const subscriber = fb()
      .collection('Users')
      .doc(userProfileId)
      .onSnapshot(async userDoc => {
        const usr = userDoc.data();
        if (!isUndefined(usr)) {
          setUserPreview({
            ref: userDoc.ref,
            name: usr.name as string,
            worlds: usr.worlds as WorldPreview[] | undefined,
            image: usr.image as ImageType | undefined,
          });
        } else {
          setUserPreview(undefined);
        }
        scrollRef.current?.scrollToOffset({offset: 0, animated: true});
      });
    // Stop listening for updates when no longer required
    return () => {
      if (subscriber !== undefined) {
        subscriber();
      }
    };
  }, [userProfileId]);

  const [highlightedPlayer, setHighlightedPlayer] = useState<
    string | undefined
  >(undefined);
  const numHighlighted = useRef<number>(0);

  const userPlayer = isUndefined(userPreview)
    ? undefined
    : players.find(p => p.docRef.id === userPreview.ref.id);

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
      }, 270);
    }
  }, [userPlayer]);

  useEffect(() => {
    setUserProfileId(userIdFromParamRoute);
  }, [setUserProfileId, userIdFromParamRoute]);

  if (userPreview === undefined) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.textNotFound}>{'User not found'}</Text>
      </View>
    );
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
                isUser={curUserId === item.docRef.id}
                {...item}
                highlight={highlightedPlayer === item.docRef.id}
                onPress={() => {
                  setUserProfileId(item.docRef.id);
                }}
              />
            </View>
          );
        }}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <ProfileHeader
              user={userPreview}
              player={userPlayer}
              jumpToPlayer={scrollToPlayer}
              setCurrentUser={() => {
                setUserProfileId(curUserId);
              }}
              isCurrentUser={curUserId === userProfileId}
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

  notFound: {
    backgroundColor: '#eeeeef',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textNotFound: {fontSize: 20, color: 'black'},
});

export default ProfileTab;
