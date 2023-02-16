import React from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import {
  PendingScore,
  useKeyboard,
  useSelectionPlayerProgress,
} from '../../../utils/store';
import ScoreInBankContainer from './scoreInBankContainer';
import LinearGradient from 'react-native-linear-gradient';

//bottomScoresContainer
interface BottomScoresContainerProps {
  totalScore: number;
  scoreInBank?: PendingScore;
  currentLeaderId?: string;
  setScoreInBank: (score: string, expirationDate: Date) => Promise<boolean>;
  turnAsLeader: (id: string) => Promise<boolean>;
  removeLeader: () => Promise<boolean>;
  removeFromGroup: (id: string) => Promise<boolean>;
  setBankScoreToPlayers: () => void;
}

const BottomScoresContainer = ({
  totalScore,
  scoreInBank,
  currentLeaderId,
  setScoreInBank,
  turnAsLeader,
  removeLeader,
  removeFromGroup,
  setBankScoreToPlayers,
}: BottomScoresContainerProps) => {
  const selectedPlayerId = useSelectionPlayerProgress(
    state => state.selectedPlayer,
  );
  const removeSelection = useSelectionPlayerProgress(
    state => state.removeSelection,
  );

  const keyboardOffset = useKeyboard(state => state.height);

  return (
    <Animated.View
      style={[
        styles.container,
        Platform.OS === 'ios' &&
          keyboardOffset !== undefined && {paddingBottom: keyboardOffset - 40},
      ]}>
      {selectedPlayerId !== undefined && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={async () => {
              if (await removeFromGroup(selectedPlayerId)) {
                removeSelection();
              }
            }}>
            <Animated.View
              entering={ZoomIn}
              exiting={ZoomOut}
              style={styles.iconContainer}>
              <Icon
                name={'person-remove'}
                size={35}
                color="#555555"
                style={styles.icon}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              if (currentLeaderId === selectedPlayerId) {
                if (await removeLeader()) {
                  removeSelection();
                }
              } else if (await turnAsLeader(selectedPlayerId)) {
                removeSelection();
              }
            }}>
            <Animated.View
              entering={ZoomIn}
              exiting={ZoomOut}
              style={styles.iconContainer}>
              <MIcon
                name={
                  currentLeaderId === selectedPlayerId ? 'flag-off' : 'flag'
                }
                size={35}
                color="#555555"
                style={styles.icon}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}

      <Animated.View
        entering={SlideInDown.delay(100).duration(500)}
        exiting={SlideOutDown.duration(500)}
        style={styles.bottomContainer}>
        <LinearGradient
          style={styles.bottomGradient}
          colors={['white', '#5773a5', '#5773a5', '#b6a2a1']}
          start={{x: 0, y: -1}}
          end={{x: 1, y: 2}}>
          <View style={styles.scoreView}>
            <Text style={styles.scoreInBank}>
              {'Total Score: ' + totalScore}
            </Text>
            <Icon name={'star'} size={20} style={styles.icon} color="#FFDE52" />
          </View>
          <Line />
          <ScoreInBankContainer
            scoreInBank={scoreInBank}
            setScoreInBank={setScoreInBank}
            submitScoresToPlayers={setBankScoreToPlayers}
          />
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

const Line = () => <View style={styles.line} />;

const styles = StyleSheet.create({
  container: {position: 'absolute', width: '100%', bottom: 0},
  header: {justifyContent: 'space-between', flexDirection: 'row'},
  bottomContainer: {
    backgroundColor: 'white',

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    shadowColor: '#222aff',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 5,
    paddingTop: 3,
    paddingStart: 3,
    paddingEnd: 3,
    elevation: 5,
  },
  bottomGradient: {
    padding: 15,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scoreInBank: {fontSize: 17, color: 'white', fontWeight: 'bold'},
  line: {margin: 3, padding: 0.5, marginBottom: 15, backgroundColor: '#ffff'},

  scoreView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },

  icon: {},

  iconContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
    margin: 5,
    padding: 10,
    height: 55,
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomScoresContainer;
