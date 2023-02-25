import React, {useCallback, useState} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {
  useCurrentUser,
  useCurrentWorld,
  useKeyboard,
} from '../../../utils/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {FadeInDown, FadeOutDown} from 'react-native-reanimated';

import firestore from '@react-native-firebase/firestore';
import AnimatedIcon from './animatedIcon';
import {generateUUID} from '../../../utils/components/utils';
import {useTranslate} from '../../../languages/translations';

function BottomActions() {
  const keyboardOffset = useKeyboard(state => state.height);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {t} = useTranslate();
  const getCurrentWorldHeader = useCurrentUser(
    state => state.getCurrentWorldHeader,
  );
  const currentWorldData = useCurrentWorld(state => state.currentWorld);
  const getAllPlayers = useCurrentWorld(state => state.getAllPlayers);

  const addNewPlayer = useCallback(
    async (email: string): Promise<boolean> => {
      /* eslint-disable no-useless-escape */
      const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
      if (emailReg.test(email) === false) {
        const timeout = setTimeout(() => {
          setErrorMessage(null);
          clearTimeout(timeout);
        }, 5000);
        setErrorMessage(t('GROUPS.INVALID_EMAIL_ADDRESS'));
        return false;
      }
      try {
        const currentWorldHeader = getCurrentWorldHeader();
        const allPlayers = getAllPlayers();
        if (
          currentWorldHeader === undefined ||
          currentWorldData === undefined
        ) {
          return false;
        }
        const userDocument = firestore()
          .collection('Users')
          .doc(email.toLowerCase());
        const {ref: userRef, exists: userExists} = await userDocument.get();

        if (userExists) {
          if (
            currentWorldData.pendingUsers?.find(
              pendingUser => pendingUser.docRef.id === userRef.id,
            )
          ) {
            const timeout = setTimeout(() => {
              setErrorMessage(null);
              clearTimeout(timeout);
            }, 5000);
            setErrorMessage(t('GROUPS.PENDING_USER_EXISTS'));
            return false;
          } else if (
            allPlayers.find(player => player.docRef.id === userRef.id)
          ) {
            const timeout = setTimeout(() => {
              setErrorMessage(null);
              clearTimeout(timeout);
            }, 5000);
            setErrorMessage(t('GROUPS.PLAYER_EXISTS'));
            return false;
          } else if (
            currentWorldData.admins.find(adminRef => adminRef.id === userRef.id)
          ) {
            const timeout = setTimeout(() => {
              setErrorMessage(null);
              clearTimeout(timeout);
            }, 5000);
            setErrorMessage(t('GROUPS.ADMIN_NOT_ALLOWED_TO_BE_IN_GROUP'));
            return false;
          } else {
            currentWorldHeader.refData.update({
              pendingUsers: firestore.FieldValue.arrayUnion({
                docRef: userRef,
                score: 0,
              }),
            });
          }
        } else {
          await userDocument.set({
            name: email.slice(0, email.lastIndexOf('@')),
          });
          currentWorldHeader.refData.update({
            pendingUsers: firestore.FieldValue.arrayUnion({
              docRef: userDocument,
              score: 0,
            }),
          });
        }
        userDocument.update({
          worlds: firestore.FieldValue.arrayUnion({
            smallData: currentWorldHeader.ref,
            bigData: currentWorldHeader.refData,
          }),
        });
        return true;
      } catch (error) {
        console.error((error as Error).message);
        const timeout = setTimeout(() => {
          setErrorMessage(null);
          clearTimeout(timeout);
        }, 5000);
        setErrorMessage(t('GROUPS.SOMETHING_WENT_WRONG'));
      }
      return false;
    },
    [currentWorldData, getAllPlayers, getCurrentWorldHeader, t],
  );

  const createNewGroup = useCallback(
    async (name: string): Promise<boolean> => {
      if (name.length < 3) {
        const timeout = setTimeout(() => {
          setErrorMessage(null);
          clearTimeout(timeout);
        }, 5000);
        setErrorMessage(t('GROUPS.GROUP_NAME_TOO_SHORT'));
        return false;
      }
      try {
        const currentWorldHeader = getCurrentWorldHeader();
        if (
          currentWorldHeader === undefined ||
          currentWorldData === undefined
        ) {
          return false;
        }
        if (
          currentWorldData.groups.findIndex(group => group.name === name) === -1
        ) {
          const newGroup = {
            id: generateUUID(),
            name: name,
            /* leader: None, */
            players: [],
            /* scoreInBank: 0, */
          };
          currentWorldHeader.refData.update({
            groups: firestore.FieldValue.arrayUnion(newGroup),
          });
          return true;
        } else {
          const timeout = setTimeout(() => {
            setErrorMessage(null);
            clearTimeout(timeout);
          }, 5000);
          setErrorMessage(t('GROUPS.GROUP_NAME_EXISTS'));
        }
      } catch (error) {
        console.error((error as Error).message);
        const timeout = setTimeout(() => {
          setErrorMessage(null);
          clearTimeout(timeout);
        }, 5000);
        setErrorMessage(t('GROUPS.SOMETHING_WENT_WRONG'));
      }

      return false;
    },
    [currentWorldData, getCurrentWorldHeader, t],
  );

  const [bottomActionsOffset, setBottomActionsOffset] = useState<number>(0);

  return (
    <View
      pointerEvents={'box-none'}
      style={[
        styles.addNewContainer,
        {
          ...(keyboardOffset !== undefined
            ? {
                position: 'absolute',
                bottom:
                  keyboardOffset +
                  bottomActionsOffset -
                  (Platform.OS === 'ios' ? 105 : 360),
              }
            : {bottom: 0}),
        },
      ]}>
      {errorMessage && (
        <Animated.View
          style={styles.alertContainer}
          entering={FadeInDown.duration(400)}
          exiting={FadeOutDown}>
          <Ionicons name="alert-circle-outline" size={30} color="#900" />
          <Text style={styles.alertText}>{errorMessage}</Text>
        </Animated.View>
      )}
      <AnimatedIcon
        icon={'person-add-alt-1'}
        placeHolder={t('GROUPS.ENTER_EMAIL_ADDRESS')}
        onFocus={setBottomActionsOffset}
        keyboardOpened={keyboardOffset !== undefined}
        onSubmit={addNewPlayer}
      />
      <AnimatedIcon
        icon={'group-add'}
        placeHolder={t('GROUPS.ENTER_GROUP_UNIQUE_NAME')}
        onFocus={setBottomActionsOffset}
        keyboardOpened={keyboardOffset !== undefined}
        onSubmit={createNewGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  alertContainer: {
    alignSelf: 'baseline',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: '#F7F7F7',
    borderRadius: 25,
    paddingHorizontal: 8,
    marginHorizontal: 10,
  },
  alertText: {color: '#900', paddingHorizontal: 5},

  addNewContainer: {
    flex: 1,
    width: '100%',
  },
});

export default BottomActions;
