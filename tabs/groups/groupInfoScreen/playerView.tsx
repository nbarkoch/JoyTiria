import React, {useEffect, useRef, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {useQuery} from 'react-query';
import {Player, User, useSelectionPlayerProgress} from '../../../utils/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {TabsNavigationProp} from '../../../navigation';

const DEFAULT_IMAGE = {
  uri: 'https://www.vigcenter.com/public/all/images/default-image.jpg',
};

type PlayerViewProps = {
  place: number;
  isLeader: boolean;
  editScorePermission: boolean;
  editPlayerPermission: boolean;
  size: number;
  setCurrentPlayerScore: (score: number) => void;
  setPlayerPendingScore: (score: number) => void;
  scoreLimit?: number;
} & Player;

const PlayerView = ({
  score,
  pendingScoreGroup,
  docRef,
  place,
  isLeader,
  editScorePermission,
  editPlayerPermission,
  size,
  scoreLimit,
  setCurrentPlayerScore,
  setPlayerPendingScore,
}: PlayerViewProps) => {
  const {data: user} = useQuery<User | undefined, Error>(
    ['USER', {id: docRef.id}],
    async () => {
      const response = await docRef.get();
      return response.data() as User | undefined;
    },
  );
  const setSelectedPlayer = useSelectionPlayerProgress(
    state => state.setSelectedPlayer,
  );
  const removeSelection = useSelectionPlayerProgress(
    state => state.removeSelection,
  );
  const navigation = useNavigation<TabsNavigationProp>();

  const isSelected =
    useSelectionPlayerProgress(state => state.selectedPlayer) === docRef.id;

  const [editScore, setEditScore] = useState<boolean>(false);
  const [editedScoreText, setEditedScoreText] = useState<string>(
    score.toString(),
  );
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (editScore) {
      const timeout = setTimeout(() => {
        textInputRef.current?.focus();
        clearTimeout(timeout);
      }, 100);
    } else {
      textInputRef.current?.blur();
    }
  }, [editScore]);

  if (user === undefined) {
    return <></>;
  }

  const keyPlace = place === 1 ? 'Place1' : place === 2 ? 'Place2' : 'Place3';
  const incrementDisabled =
    pendingScoreGroup !== undefined &&
    scoreLimit !== undefined &&
    scoreLimit === 0;

  const decrementDisabled =
    pendingScoreGroup === undefined ||
    pendingScoreGroup === null ||
    pendingScoreGroup.score < 1;

  const colors = [
    ['#FFCF20ff', '#F5F5F5'],
    ['#BFBFBFff', '#F5F5F5'],
    ['#d29967ff', '#F5F5F5'],
  ];

  const borderScale = size > 4 && place < 4 ? styleScale[keyPlace] : {};
  const borderColors =
    size > 4 && place < 4 ? colors[place - 1] : ['#ECF2F4', '#F5F5F5'];
  const styleInnerPlaces = size > 4 && place < 4 ? stylesInner[keyPlace] : {};
  const selectedStyle = {backgroundColor: '#dddd'};
  const pressEvents = {
    onLongPress: () => {
      if (editPlayerPermission) {
        setSelectedPlayer(docRef.id);
      }
    },
    onPress: () => {
      if (editPlayerPermission && isSelected) {
        removeSelection();
      } else {
        navigation.navigate('Profile', {userId: docRef.id});
      }
    },
  };

  const incrementScore = async () => {
    setPlayerPendingScore(
      pendingScoreGroup === undefined || pendingScoreGroup === null
        ? 1
        : pendingScoreGroup.score + 1,
    );
  };

  const decrementScore = async () => {
    setPlayerPendingScore(
      pendingScoreGroup === undefined || pendingScoreGroup === null
        ? 0
        : pendingScoreGroup.score - 1,
    );
  };

  return (
    <TouchableOpacity {...pressEvents}>
      <LinearGradient
        style={[styles.player, borderScale]}
        colors={borderColors}
        start={{x: 0, y: 0}}
        end={{x: 0.35, y: 1.3}}>
        <View
          style={[
            styles.playerInnerView,
            styleInnerPlaces,
            isSelected && selectedStyle,
          ]}>
          <Text style={styles.place}>{place}</Text>

          <Image
            style={[
              styles.playerImage,
              {
                ...(isLeader
                  ? {
                      borderColor: 'red',
                      borderWidth: 2,
                    }
                  : {}),
              },
            ]}
            source={
              user !== undefined && user.image !== undefined
                ? user.image
                : DEFAULT_IMAGE
            }
          />
          {isLeader && (
            <IonIcon name={'flag'} size={20} style={styles.icon} color="red" />
          )}

          <Text style={styles.playerName} numberOfLines={2}>
            {`${user.name}${isLeader ? ' (Leader)' : ''}`}
          </Text>

          <View style={styles.playerScoreView}>
            {!isSelected && editScorePermission && (
              <View style={styles.playerScoreSubView}>
                <Icon
                  name={'remove'}
                  size={25}
                  style={styles.icon}
                  color={decrementDisabled ? '#dfdfdfff' : 'grey'}
                  disabled={decrementDisabled}
                  onPress={decrementScore}
                />
                <Icon
                  name={'add'}
                  size={25}
                  style={styles.icon}
                  color={incrementDisabled ? '#dfdfdfff' : 'grey'}
                  disabled={incrementDisabled}
                  onPress={incrementScore}
                />
                <Text style={styles.score}>
                  {pendingScoreGroup !== undefined && pendingScoreGroup !== null
                    ? pendingScoreGroup.score
                    : 0}
                </Text>
              </View>
            )}

            {isSelected && (
              <Icon
                name={editScore ? 'done' : 'edit'}
                size={25}
                style={styles.icon}
                color="grey"
                {...(editPlayerPermission
                  ? {
                      onPress: () => {
                        if (editScore) {
                          const newScore = parseInt(editedScoreText, 10);
                          setCurrentPlayerScore(newScore);
                          removeSelection();
                        } else {
                          setEditedScoreText(score.toString());
                        }
                        setEditScore(!editScore);
                      },
                    }
                  : {})}
              />
            )}
            {editScore ? (
              <TextInput
                ref={textInputRef}
                style={styles.score}
                value={editedScoreText}
                onChangeText={setEditedScoreText}
                keyboardType={'numeric'}
              />
            ) : (
              <Text style={styles.score}>{score}</Text>
            )}

            <Icon name={'star'} size={25} style={styles.icon} color="#FFDE52" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  player: {
    flex: 1,
    marginBottom: 1,
    padding: 2,
    borderRadius: 7,
  },
  playerInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdffff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  place: {paddingHorizontal: 5},
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
    marginHorizontal: 5,
  },
  playerName: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    paddingHorizontal: 5,
    flex: 1,
  },
  score: {
    color: 'black',
    fontSize: 16,
    paddingHorizontal: 5,
  },
  icon: {},

  playerScoreView: {
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'white',
  },

  playerScoreSubView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 20,
    padding: 3,
  },
});

const styleScale = StyleSheet.create({
  Place1: {
    transform: [{scale: 1.015}],
    padding: 5,
    marginBottom: 1.5,
  },
  Place2: {
    transform: [{scale: 1.01}],
    padding: 4,
    marginBottom: 1.5,
  },
  Place3: {
    transform: [{scale: 1.0025}],
    padding: 3,
  },
});

const stylesInner = StyleSheet.create({
  Place1: {
    paddingVertical: 20,
  },
  Place2: {
    paddingVertical: 17,
  },
  Place3: {
    paddingVertical: 14,
  },
});

export default PlayerView;
