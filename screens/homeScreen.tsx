import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ProfileScreenNavigationProp, RootStackParamList} from '../navigation';
import ProfileTab from '../tabs/profile/profileTab';
import GroupsTab, {GroupsTabHeaderLeft} from '../tabs/groups/groupsTab';
import AnnouncementsTab, {
  AnnouncementsTabHeaderLeft,
  AnnouncementsTabHeaderRight,
} from '../tabs/announcements/announcementsTab';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import {
  useCurrentUser,
  useCurrentWorld,
  useDialog,
  useGroupInfo,
  useKeyboard,
  World,
  WorldHeader,
} from '../utils/store';
import Snackbar from '../dialogs/snackbar';
import ProfileTabHeader from '../tabs/profile/profileTabHeader';
import {useTranslate} from '../languages/translations';
import HomeHeader from '../headers/homeHeader';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

function HomeScreen() {
  const Tab = createBottomTabNavigator();
  const {t} = useTranslate();
  const email = useRoute<RouteProp<RootStackParamList, 'Home'>>().params.email;
  const currentUser = useCurrentUser(state => state.user);
  const setCurrentUser = useCurrentUser(state => state.setUser);
  const removeUser = useCurrentUser(state => state.removeUser);
  const setCurrentWorldData = useCurrentWorld(state => state.setCurrentWorld);
  const removeCurrentWorldData = useCurrentWorld(
    state => state.removeCurrentWorld,
  );
  const currentWorldData = useCurrentWorld(state => state.currentWorld);
  const groupName = useGroupInfo(state => state.groupName);
  const setDialog = useDialog(state => state.setDialog);
  const [waitingAnimation, setWaitingAnimation] = useState<boolean>(false);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const createNewWorld = useCallback(
    async (name: string) => {
      try {
        if (
          name.length > 2 &&
          currentUser !== undefined &&
          currentUser.worlds.find(
            world => world.name.toLowerCase() === name.toLowerCase(),
          ) === undefined
        ) {
          const smallDataRef = await firestore().collection('WorldsNames').add({
            name: name,
          });
          const bigDataRef = await firestore()
            .collection('Worlds')
            .add({
              admins: [currentUser.ref],
              announcements: [],
              groups: [],
            });

          currentUser.ref.update({
            worlds: firestore.FieldValue.arrayUnion({
              smallData: smallDataRef,
              bigData: bigDataRef,
            }),
          });
          return true;
        }
      } catch (error) {
        console.error((error as Error).message);
      }
      return false;
    },
    [currentUser],
  );

  const setKeyboardHeight = useKeyboard(state => state.setHeight);

  const onLogOut = useCallback(async () => {
    try {
      setWaitingAnimation(true);
      await auth().signOut();
      navigation.navigate('Login');
    } catch (error) {
      const $error = error as {code: string};
      setWaitingAnimation(false);
      switch ($error.code) {
        case 'auth/network-request-failed':
        case 'connection/timeout':
          setDialog({
            title: t('ERROR'),
            message: t('FIREBASE.CONNECT_FAILED'),
          });
          break;
        default:
          setDialog({
            title: t('ERROR'),
            message: t('FIREBASE.UNKNOWN_ERROR'),
          });
      }
    }
  }, [navigation, setDialog, t]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', event => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(undefined);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [setKeyboardHeight]);

  const onDeleteWorld = useCallback(
    async (world: WorldHeader): Promise<boolean> => {
      if (currentUser === undefined) {
        return Promise.resolve(false);
      }
      return new Promise<boolean>(function (resolve) {
        setDialog({
          title: t('DIALOG.ARE_YOU_SURE'),
          message: currentWorldData?.isAdmin
            ? t('DIALOG.ADMIN_DELETE_DESCRIPTION')
            : t('DIALOG.NO_ADMIN_DELETE_DESCRIPTION'),
          onSubmit: async () => {
            try {
              if (currentWorldData?.isAdmin) {
                await world.refData.delete();
                await world.ref.delete();
              }
              await currentUser.ref.update({
                worlds: firestore.FieldValue.arrayRemove({
                  smallData: world.ref,
                  bigData: world.refData,
                }),
              });
              resolve(true);
            } catch (error) {
              console.error((error as Error).message);
            }
            resolve(false);
          },
          onDecline: () => {
            resolve(false);
          },
        });
      });
    },
    [currentUser, currentWorldData?.isAdmin, setDialog, t],
  );

  useEffect(() => {
    const subscriber = firestore()
      .collection('Users')
      .doc(email)
      .onSnapshot(async userDoc => {
        const usr = userDoc.data();

        if (usr !== undefined) {
          let worlds = usr.worlds
            ? new Array<WorldHeader>(usr.worlds.length)
            : [];

          for (let i = 0; i < worlds.length; ++i) {
            const worldDoc = await usr.worlds[i].smallData.get();
            worlds[i] = {
              ...worldDoc.data(),
              ref: worldDoc.ref,
              refData: usr.worlds[i].bigData,
            };
          }

          setCurrentUser({
            ref: userDoc.ref,
            name: usr.name as string,
            worlds: worlds,
            currentWorldRef: worlds.length > 0 ? worlds[0].refData : undefined,
          });
        }
      });
    // Stop listening for updates when no longer required
    return () => {
      if (subscriber !== undefined) {
        subscriber();
        removeUser();
      }
    };
  }, [email, removeUser, setCurrentUser]);

  useEffect(() => {
    const subscriber = currentUser?.currentWorldRef?.onSnapshot(
      documentSnapshot => {
        const worldData: World | undefined = documentSnapshot.data() as World;
        const isAdmin =
          worldData?.admins.find(user => user.id === currentUser.ref.id) !==
          undefined;
        if (worldData !== undefined) {
          setCurrentWorldData({
            ...worldData,
            isAdmin: isAdmin,
          });
        } else {
          //we should remove this reference for this user!
        }
      },
    );
    // Stop listening for updates when no longer required
    return () => {
      if (subscriber !== undefined) {
        subscriber();
        removeCurrentWorldData();
      }
    };
  }, [
    currentUser?.currentWorldRef,
    currentUser?.ref,
    setCurrentWorldData,
    removeCurrentWorldData,
  ]);

  if (currentUser === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingStyle}>{t('HOME.LOADING')}</Text>
      </View>
    );
  }

  const worlds = currentUser.worlds;

  return (
    <View style={styles.container}>
      <Tab.Navigator
        sceneContainerStyle={styles.sceneContainer}
        screenOptions={({route}) => ({
          tabBarIcon: ({color}) => {
            if (route.name === 'Profile') {
              return <MIcon name={'person'} size={35} color={color} />;
            } else if (route.name === 'Groups') {
              return <MIcon name={'groups'} size={45} color={color} />;
            } else if (route.name === 'Announcements') {
              return <Icon name={'reader'} size={30} color={color} />;
            }
          },
          tabBarActiveTintColor: '#6acad8',
          tabBarInactiveTintColor: 'gray',
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: false,
        })}>
        <Tab.Screen
          name="Announcements"
          options={{
            headerLeft: AnnouncementsTabHeaderLeft,
            headerRight: AnnouncementsTabHeaderRight,
            headerTitle: t('HOME.ANNOUNCEMENTS'),
          }}
          component={AnnouncementsTab}
        />
        <Tab.Screen
          name={'Groups'}
          component={GroupsTab}
          options={{
            headerLeft: GroupsTabHeaderLeft,
            headerTitle: groupName ?? t('HOME.GROUPS'),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileTab}
          initialParams={{userId: currentUser.ref.id}}
          options={ProfileTabHeader}
        />
      </Tab.Navigator>
      <HomeHeader
        worlds={worlds}
        onCreateWorld={createNewWorld}
        onDeleteWorld={onDeleteWorld}
        onLogOut={onLogOut}
      />
      <Snackbar />
      {waitingAnimation && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.waitingAnimationContainer}>
          <ActivityIndicator
            style={styles.waitingAnimationIndicator}
            color={'white'}
            size="large"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  imageStyle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 8,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  sceneContainer: {paddingTop: 70},
  loadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingStyle: {color: 'black', fontSize: 25, textAlign: 'center'},
  waitingAnimationContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: '#6acad899',
  },
  waitingAnimationIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
