import {firebase} from '@react-native-firebase/auth';
import {isNil, isUndefined} from 'lodash';
import React, {useCallback, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {
  Group,
  Player,
  useCurrentUser,
  useCurrentWorld,
  useKeyboard,
} from '../../../utils/store';
import BottomScoresContainer from './bottomScoresContainer';
import PlayerView from './playerView';

const GroupInfoScreen = ({players, leader, scoreInBank, id}: Group) => {
  const currentWorldRef = useCurrentUser(state => state.user?.currentWorldRef);
  const groups = useCurrentWorld(state => state.currentWorld?.groups);
  const isUserLeader = useCurrentUser(
    state =>
      state.user !== undefined &&
      !isNil(leader) &&
      state.user.ref.id === leader.docRef.id,
  );
  const isUserAdmin =
    useCurrentWorld(state => state.currentWorld?.isAdmin) ?? false;

  const keyboardActive = useKeyboard(state => !isUndefined(state.height));

  useEffect(() => {
    if (
      !isNil(scoreInBank) &&
      scoreInBank.expirationDate.toDate() < new Date()
    ) {
      setBankScoreToPlayers({clearBank: true});
    }
  });

  const updateGroup = useCallback(
    async (group: Group): Promise<boolean> => {
      if (
        currentWorldRef !== undefined &&
        groups !== undefined &&
        groups.length > 0
      ) {
        const cloneGroups = [...groups];
        cloneGroups[groups.findIndex(grp => grp.id === id)] = group;
        await currentWorldRef.firestore.settings({
          ignoreUndefinedProperties: true,
        });
        await currentWorldRef.update({
          groups: cloneGroups,
        });
        return true;
      }
      return false;
    },
    [currentWorldRef, groups, id],
  );

  const setBankScoreToPlayers = useCallback(
    async (
      options: {clearBank: boolean} | undefined = undefined,
    ): Promise<boolean> => {
      const cloneGroup = groups?.find(grp => grp.id === id);
      if (!isNil(scoreInBank) && cloneGroup !== undefined) {
        players.forEach(p => {
          if (!isNil(p.pendingScoreGroup)) {
            if (
              p.pendingScoreGroup.groupId === id &&
              p.pendingScoreGroup.score > 0
            ) {
              p.score += p.pendingScoreGroup.score;
            }
            p.pendingScoreGroup = undefined;
          }
        });
        cloneGroup.players = players;

        const shouldClearBank =
          scoreInBank.score === 0 ||
          (!isUndefined(options) && options.clearBank);

        cloneGroup.scoreInBank = shouldClearBank ? null : scoreInBank;

        return updateGroup(cloneGroup);
      }
      return Promise.resolve(false);
    },
    [groups, id, players, scoreInBank, updateGroup],
  );

  const setScoreToPlayer = (player: Player, score: number) => {
    if (Number.isNaN(score)) {
      return;
    }
    const cloneGroup = groups?.find(grp => grp.id === id);
    if (!isUndefined(cloneGroup) && !isUndefined(groups)) {
      const playerIndex = cloneGroup.players.findIndex(
        p => p.docRef.id === player.docRef.id,
      );

      if (playerIndex !== -1) {
        cloneGroup.players[playerIndex].score = score;
        updateGroup(cloneGroup);
      }
    }
  };

  const setScoreInBank = (
    score: string,
    expirationDate: Date,
  ): Promise<boolean> => {
    const newScore = parseInt(score, 10);
    if (Number.isNaN(newScore)) {
      return Promise.resolve(false);
    }
    const cloneGroup = groups?.find(grp => grp.id === id);
    if (
      !isUndefined(cloneGroup) &&
      !isUndefined(groups) &&
      expirationDate > new Date()
    ) {
      cloneGroup.scoreInBank = {
        score: newScore,
        expirationDate: firebase.firestore.Timestamp.fromDate(expirationDate),
      };
      cloneGroup.scoreInBank.score = newScore;
      return updateGroup(cloneGroup);
    }
    return Promise.resolve(false);
  };

  const setPlayerPendingScore = (player: Player, score: number) => {
    if (Number.isNaN(score) || groups === undefined) {
      return;
    }
    const cloneGroup = groups.find(grp => grp.id === id);

    if (cloneGroup !== undefined && !isNil(cloneGroup.scoreInBank)) {
      const playerIndex = cloneGroup.players.findIndex(
        p => p.docRef.id === player.docRef.id,
      );
      if (playerIndex !== -1) {
        const prevScore = !isNil(player.pendingScoreGroup)
          ? player.pendingScoreGroup.score
          : 0;
        if (
          (score - prevScore > 0 && cloneGroup.scoreInBank.score > 0) ||
          (score - prevScore < 0 && prevScore > 0)
        ) {
          player.pendingScoreGroup = {
            score,
            groupId: id,
          };
          cloneGroup.scoreInBank.score += prevScore - score;
          cloneGroup.players[playerIndex] = player;
          updateGroup(cloneGroup);
        }
      }
    }
  };

  const turnAsLeader = useCallback(
    async (playerId: string): Promise<boolean> => {
      const cloneGroup = groups?.find(grp => grp.id === id);
      if (!isUndefined(cloneGroup) && !isUndefined(groups)) {
        const playerIndex = cloneGroup.players.findIndex(
          p => p.docRef.id === playerId,
        );
        if (playerIndex !== -1) {
          cloneGroup.leader = {docRef: cloneGroup.players[playerIndex].docRef};
          return updateGroup(cloneGroup);
        }
      }
      return false;
    },
    [groups, id, updateGroup],
  );

  const removeLeader = useCallback(async (): Promise<boolean> => {
    const cloneGroup = groups?.find(grp => grp.id === id);
    if (cloneGroup !== undefined && groups !== undefined) {
      cloneGroup.leader = null;
      return updateGroup(cloneGroup);
    }
    return false;
  }, [groups, id, updateGroup]);

  const removeFromGroup = useCallback(
    async (playerId: string): Promise<boolean> => {
      let cloneGroup = groups?.find(grp => grp.id === id);
      if (
        !isUndefined(currentWorldRef) &&
        !isUndefined(cloneGroup) &&
        !isUndefined(groups)
      ) {
        const playerIndex = cloneGroup.players.findIndex(
          p => p.docRef.id === playerId,
        );
        if (cloneGroup.leader?.docRef.id === playerId) {
          cloneGroup.leader = null;
        }
        const playerToRemove = cloneGroup.players[playerIndex];

        try {
          if (playerIndex !== -1) {
            if (
              !isNil(playerToRemove.pendingScoreGroup) &&
              !isNil(cloneGroup.scoreInBank)
            ) {
              cloneGroup.scoreInBank.score +=
                playerToRemove.pendingScoreGroup.score;
            }
            playerToRemove.pendingScoreGroup = null;
            await firebase
              .firestore()
              .settings({ignoreUndefinedProperties: true});

            cloneGroup.players.splice(playerIndex, 1);
            const cloneGroups = [...groups];
            cloneGroups[groups.findIndex(grp => grp.id === id)] = cloneGroup;

            await currentWorldRef.update({
              groups: cloneGroups,
              pendingUsers:
                firebase.firestore.FieldValue.arrayUnion(playerToRemove),
            });
            return true;
          }
        } catch (error) {
          console.error((error as Error).message);
        }
      }
      return false;
    },
    [currentWorldRef, groups, id],
  );

  const renderItem = ({item, index}: {item: Player; index: number}) => {
    if (
      item.pendingScoreGroup !== undefined &&
      item.pendingScoreGroup !== null &&
      item.pendingScoreGroup.groupId !== id
    ) {
      item.pendingScoreGroup = undefined;
    }

    return (
      <PlayerView
        {...item}
        place={index + 1}
        isLeader={item.docRef.id === leader?.docRef.id ?? false}
        editScorePermission={
          (isUserLeader || isUserAdmin) && !isNil(scoreInBank)
        }
        editPlayerPermission={isUserAdmin}
        size={players.length}
        setCurrentPlayerScore={score => setScoreToPlayer(item, score)}
        setPlayerPendingScore={score => setPlayerPendingScore(item, score)}
        scoreLimit={scoreInBank?.score}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={[styles.players]}
        contentContainerStyle={styles.playersContainer}
        data={players.sort((a, b) => b.score - a.score)}
        renderItem={renderItem}
        keyboardShouldPersistTaps="always"
      />
      {!keyboardActive && (
        <BottomScoresContainer
          scoreInBank={scoreInBank ?? undefined}
          totalScore={players.reduce(
            (accumulator, curValue) => accumulator + curValue.score,
            0,
          )}
          setScoreInBank={setScoreInBank}
          turnAsLeader={turnAsLeader}
          removeLeader={removeLeader}
          removeFromGroup={removeFromGroup}
          currentLeaderId={leader?.docRef.id}
          setBankScoreToPlayers={setBankScoreToPlayers}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#405C93',
  },
  players: {flex: 1},
  playersContainer: {
    paddingBottom: 300,
    padding: 7,
  },
});

export default GroupInfoScreen;
