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
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import BasicPlayerView from './basicPlayerView';
import ProfileHeader from './profileHeader';
import {RouteProp, useRoute} from '@react-navigation/native';
import {TabsStackParamList} from '../../navigation';
import fb from '@react-native-firebase/firestore';

const Header = ({
  userPreview,
  userPlayer,
  scrollToPlayer,
  setCurrentUser,
  isCurrentUser,
}: {
  userPreview: UserPreview;
  userPlayer: Player | undefined;
  scrollToPlayer: () => void;
  setCurrentUser: () => void;
  isCurrentUser: boolean;
}) => (
  <View style={styles.header}>
    <ProfileHeader
      user={userPreview}
      player={userPlayer}
      jumpToPlayer={scrollToPlayer}
      setCurrentUser={setCurrentUser}
      isCurrentUser={isCurrentUser}
    />
  </View>
);

function ProfileTab() {
  const curUserId = useCurrentUser(state => state.user?.ref.id);
  const userIdFromParamRoute =
    useRoute<RouteProp<TabsStackParamList, 'Profile'>>().params.userId;
  const userProfileId = useProfile(state => state.userProfileId);
  const setUserProfileId = useProfile(state => state.setUserProfileId);

  const [userPreview, setUserPreview] = useState<UserPreview | undefined>(
    undefined,
  );

  const currentWorld = useCurrentWorld(state => state.currentWorld);

  const players = useMemo(() => {
    if (isUndefined(currentWorld)) {
      return [];
    }
    const {admins, pendingUsers, groups} = currentWorld;
    let $players = groups.map(g => g.players).flat();
    if (admins !== undefined) {
      $players = $players.concat(
        admins.map(admin => ({
          docRef: admin,
          score: 0,
          pendingScore: undefined,
        })),
      );
    }
    if (pendingUsers !== undefined) {
      $players = $players.concat(pendingUsers);
    }
    return $players;
  }, [currentWorld]);

  const userPlayer = useMemo(() => {
    if (!isUndefined(userPreview)) {
      return players.find(p => p.docRef.id === userPreview.ref.id);
    }
    return undefined;
  }, [players, userPreview]);

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

  const setCurrentUser = useCallback(() => {
    setUserProfileId(curUserId);
  }, [curUserId, setUserProfileId]);

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
                  if (userProfileId === item.docRef.id) {
                    scrollRef.current?.scrollToOffset({
                      offset: 0,
                      animated: true,
                    });
                  } else {
                    // only if succeed getting user profile then scroll
                    setUserProfileId(item.docRef.id);
                  }
                }}
              />
            </View>
          );
        }}
        ListHeaderComponent={
          <Header
            userPreview={userPreview}
            userPlayer={userPlayer}
            scrollToPlayer={scrollToPlayer}
            setCurrentUser={setCurrentUser}
            isCurrentUser={curUserId === userProfileId}
          />
        }
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
