import React, {useEffect, useRef, useState} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

import {PendingScore, useCurrentWorld} from '../../../utils/store';
import Animated, {
  ZoomIn,
  Transition,
  Transitioning,
  TransitioningView,
} from 'react-native-reanimated';
import dayjs from 'dayjs';
import {isNil} from 'lodash';

const TRANSITION_DURATION = 200;

const transition = (
  <Transition.Together>
    <Transition.In type="fade" durationMs={TRANSITION_DURATION} />
    <Transition.Change />
    <Transition.Out type="fade" durationMs={TRANSITION_DURATION} />
  </Transition.Together>
);

interface ScoreInBankContainerProps {
  scoreInBank?: PendingScore;
  setScoreInBank: (score: string, expirationDate: Date) => Promise<boolean>;
  submitScoresToPlayers: () => void;
}

function ScoreInBankContainer({
  scoreInBank,
  setScoreInBank,
  submitScoresToPlayers,
}: ScoreInBankContainerProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedScoreText, setEditedScoreText] = useState<string>(
    scoreInBank === undefined || scoreInBank.score === 0
      ? ''
      : scoreInBank.score.toString(),
  );

  const [datePickerShown, setDatePickerShown] = useState<boolean>(
    Platform.OS === 'ios',
  );
  const textInputRef = useRef<TextInput>(null);
  const isAdmin =
    useCurrentWorld(state => state.currentWorld?.isAdmin) ?? false;
  const [expirationDate, setExpirationDate] = useState<Date>(
    scoreInBank === undefined ? tomorrow : scoreInBank.expirationDate.toDate(),
  );
  const ref = useRef<TransitioningView>(null);

  useEffect(() => {
    if (editMode) {
      const timeout = setTimeout(() => {
        textInputRef.current?.focus();
        clearTimeout(timeout);
      }, 300);
    } else {
      textInputRef.current?.blur();
    }
  }, [editMode]);

  return (
    <View style={styles.container}>
      {isAdmin ? (
        <>
          <Text style={styles.title}>
            {editMode
              ? 'Set Score In Bank '
              : scoreInBank === undefined
              ? 'Currently, there is no score in bank '
              : 'Score In Bank '}
          </Text>
          <Transitioning.View
            ref={ref}
            transition={transition}
            style={styles.setScoreInBankView}>
            {!editMode ? (
              <TouchableOpacity
                onPress={() => {
                  setEditedScoreText(
                    !isNil(scoreInBank) && scoreInBank.score > 0
                      ? scoreInBank.score.toString()
                      : '',
                  );
                  setEditMode(true);
                  ref.current?.animateNextTransition();
                }}>
                {!isNil(scoreInBank) &&
                scoreInBank.expirationDate.toDate() >= new Date() ? (
                  <View style={styles.directionRow}>
                    <View style={styles.scoreEditableContainer}>
                      <View style={styles.scoreSubview}>
                        <Icon
                          name={'edit'}
                          size={25}
                          style={styles.icon}
                          color="grey"
                        />
                        <Text style={styles.scoreInBank}>
                          {scoreInBank.score.toString()}
                        </Text>
                        <Icon
                          name={'star'}
                          size={20}
                          style={styles.icon}
                          color="#FFDE52"
                        />
                      </View>
                      <Text style={styles.expireDateView}>
                        {`(Until ${dayjs(expirationDate).format(
                          'DD.MM.YYYY',
                        )})`}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={submitScoresToPlayers}>
                      <Animated.View
                        entering={ZoomIn.delay(80)}
                        style={styles.confirmScoresView}>
                        <Text style={styles.confirmScoresText}>{'Submit'}</Text>
                      </Animated.View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.setScoreInBank}>
                    {'Set Score in Bank'}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.editModeSubview}>
                  <Icon
                    name={editedScoreText.length > 0 ? 'done' : 'close'}
                    size={25}
                    style={styles.icon}
                    color="grey"
                    onPress={async () => {
                      if (editedScoreText.length > 0) {
                        const resultSuccess = await setScoreInBank(
                          editedScoreText,
                          expirationDate,
                        );

                        if (resultSuccess) {
                          setEditMode(false);
                          ref.current?.animateNextTransition();
                        }
                      } else {
                        setEditMode(false);
                        ref.current?.animateNextTransition();
                      }
                    }}
                  />
                  <TextInput
                    ref={textInputRef}
                    style={styles.textInput}
                    value={editedScoreText}
                    onChangeText={text =>
                      setEditedScoreText(text.replace(/[^0-9]/g, ''))
                    }
                    keyboardType={'numeric'}
                    selectionColor={'black'}
                    placeholder={'score in bank'}
                  />
                  <Animated.View
                    entering={ZoomIn.delay(80)}
                    style={styles.datePickerView}>
                    <Text style={styles.datePickerTitle}>expire date</Text>
                    {Platform.OS === 'ios' || datePickerShown ? (
                      <DateTimePicker
                        minimumDate={tomorrow}
                        value={expirationDate}
                        mode={'date'}
                        onChange={(_, value) => {
                          if (value !== undefined) {
                            setExpirationDate(value);
                            setDatePickerShown(false);
                          }
                        }}
                        style={styles.datePicker}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setDatePickerShown(true);
                        }}>
                        <Text style={styles.datePickerContent}>
                          {dayjs(expirationDate).format('DD.MM.YYYY')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                </View>
              </>
            )}
          </Transitioning.View>
        </>
      ) : (
        <View style={styles.scoreView}>
          {scoreInBank === undefined || scoreInBank.score === 0 ? (
            <Text style={styles.title}>
              {'Currently, there is no score in bank '}
            </Text>
          ) : (
            <>
              <Text style={styles.title}>
                {'Score in bank: ' + scoreInBank.score.toString()}
              </Text>
              <Icon
                name={'star'}
                size={20}
                style={styles.icon}
                color="#FFDE52"
              />
            </>
          )}
        </View>
      )}
    </View>
  );
}

export default ScoreInBankContainer;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {fontSize: 17, color: 'white', fontWeight: 'bold'},
  scoreSubview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 7,
    justifyContent: 'center',
  },
  editModeSubview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 7,
    flex: 1,
  },
  textInput: {paddingHorizontal: 5, flex: 1, fontSize: 17, color: 'black'},

  setScoreInBankView: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 5,
    flex: 1,
  },
  scoreInBank: {
    fontSize: 17,
    color: 'grey',
    paddingStart: 5,
    fontWeight: 'bold',
  },

  setScoreInBank: {
    fontSize: 17,
    color: 'grey',
    padding: 8,
    fontWeight: 'bold',
  },

  scoreView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },

  datePickerView: {
    borderRadius: 10,
    flex: 1,
    backgroundColor: 'white',
  },

  icon: {},
  datePicker: {},
  datePickerTitle: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
  },
  datePickerContent: {
    color: 'black',
    fontSize: 17,
    textAlign: 'center',
    borderRadius: 10,
    backgroundColor: '#eeeeee',
    padding: 10,
  },
  expireDateView: {
    color: '#7f7faf',
    fontSize: 12,
    paddingHorizontal: 7,
    paddingBottom: 7,
    fontWeight: 'bold',
    borderRadius: 10,
    textAlign: 'center',
  },
  scoreEditableContainer: {
    flexDirection: 'column',
    borderTopStartRadius: 10,
    borderBottomStartRadius: 10,
  },
  confirmScoresView: {
    backgroundColor: '#5db488',
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
    justifyContent: 'center',
    padding: 8,
    flex: 1,
  },
  confirmScoresText: {
    color: 'white',
    fontWeight: 'bold',
  },
  directionRow: {flexDirection: 'row'},
});
