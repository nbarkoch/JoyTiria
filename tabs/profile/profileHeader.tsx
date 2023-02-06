import {isNil, isUndefined} from 'lodash';
import React, {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Player, useCurrentWorld, User} from '../../utils/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import LinearGradient from 'react-native-linear-gradient';
import {useCallback, useEffect, useRef, useState} from 'react';
import Animated from 'react-native-reanimated';

const DEFAULT_IMAGE = {
  uri: 'https://www.vigcenter.com/public/all/images/default-image.jpg',
};

const Liner = () => {
  return <View style={userStyle.liner} />;
};

interface ProfileHeaderProps {
  user: User;
  player?: Player;
  jumpToPlayer: () => void;
  setCurrentUser: () => void;
  isCurrentUser: boolean;
}

interface TextSectionProps {
  title: string;
  value: string | number;
}

const TextSection = ({title, value}: TextSectionProps): JSX.Element => {
  return (
    <Text style={userStyle.text}>
      <Text style={userStyle.key}>{title}</Text>
      <Text style={userStyle.value}>{value}</Text>
    </Text>
  );
};

const ProfileHeader = ({
  user,
  player,
  jumpToPlayer,
  setCurrentUser,
  isCurrentUser = false,
}: ProfileHeaderProps): JSX.Element => {
  const {name, ref, image} = user;
  const [score, pendingScore] = player
    ? [player.score, player.pendingScoreGroup]
    : [0];
  const isAdmin = useCurrentWorld(state =>
    state.currentWorld?.admins.find(admin => admin.id === user.ref.id),
  );
  const isLeader = useCurrentWorld(
    state =>
      !isUndefined(
        state.currentWorld?.groups.find(
          g => g.leader?.docRef.id === user.ref.id,
        ),
      ),
  );

  const [editMode, setEditMode] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>(name);
  const textInputRef = useRef<TextInput>(null);

  const setNewName = useCallback(
    (newName: string) => {
      if (newName.length >= 3) {
        ref.update({name: newName});
      }
    },
    [ref],
  );

  useEffect(() => {
    if (isCurrentUser && editMode) {
      const timeout = setTimeout(() => {
        textInputRef.current?.focus();
        clearTimeout(timeout);
      }, 100);
    } else {
      textInputRef.current?.blur();
    }
  }, [isCurrentUser, editMode]);

  return (
    <Animated.View style={userStyle.container}>
      <Image
        style={userStyle.image}
        source={image !== undefined ? image : DEFAULT_IMAGE}
      />
      <View style={userStyle.userInfo}>
        <View style={userStyle.section}>
          <View style={userStyle.text}>
            <Text style={userStyle.key}>{'Name: '}</Text>
            {editMode ? (
              <TextInput
                ref={textInputRef}
                style={userStyle.textInput}
                value={textInput}
                autoCorrect={false}
                onChangeText={setTextInput}
              />
            ) : (
              <>
                <Text style={userStyle.value}>{name}</Text>
                {isAdmin && (
                  <Text style={userStyle.admin}>
                    <Text>{' ('}</Text>
                    <MIcon name={'crown'} size={16} color="#FFDE52" />
                    <Text>{' Admin)'}</Text>
                  </Text>
                )}
                {isLeader && (
                  <Text style={userStyle.admin}>
                    <Text>{' ('}</Text>
                    <MIcon name={'flag'} size={16} color="red" />
                    <Text>{' Leader)'}</Text>
                  </Text>
                )}
              </>
            )}
          </View>
          {isCurrentUser && (
            <TouchableOpacity
              onPress={() => {
                if (editMode) {
                  setNewName(textInput);
                } else {
                  setTextInput(name);
                }
                setEditMode(!editMode);
              }}>
              <Icon name={editMode ? 'done' : 'edit'} size={20} color="grey" />
            </TouchableOpacity>
          )}
        </View>
        <Liner />
        <TextSection title={'Email: '} value={ref.id} />
        <Liner />
        <TextSection title={'Current Score: '} value={score} />
        <Liner />
        <TextSection
          title={'Pending Score: '}
          value={!isNil(pendingScore) ? pendingScore.score : 0}
        />
      </View>
      <View style={userStyle.buttonsContainer}>
        {!isUndefined(player) && (
          <TouchableOpacity
            style={userStyle.buttonContainer}
            onPress={jumpToPlayer}>
            <LinearGradient
              style={[userStyle.button]}
              colors={['#1273de', '#6292e1']}>
              <Icon
                name={'arrow-downward'}
                size={25}
                style={userStyle.arrowIcon}
                color="white"
              />
              <Text style={userStyle.buttonText}>{'See Player Status'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {!isCurrentUser && (
          <TouchableOpacity
            style={userStyle.buttonContainer}
            onPress={setCurrentUser}>
            <LinearGradient
              style={[userStyle.button]}
              colors={['#de3456', '#d04598']}>
              <Icon
                name={'cancel'}
                size={25}
                style={userStyle.arrowIcon}
                color="white"
              />
              <Text style={userStyle.buttonText}>{'See Your Status'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default ProfileHeader;

const userStyle = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white', padding: 5},
  value: {color: 'black', fontWeight: 'bold'},
  key: {color: 'grey'},
  admin: {color: 'black'},
  image: {
    height: 200,
    width: 200,
    alignSelf: 'center',
    borderRadius: 10,
    margin: 20,
    zIndex: -1,
  },
  userInfo: {
    borderColor: 'grey',
    borderRadius: 5,
    borderWidth: 1,
    padding: 12,
    margin: 10,
  },
  liner: {margin: 10, height: 1, backgroundColor: 'grey'},
  icon: {},
  button: {
    borderRadius: 15,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    flexDirection: 'row',
  },
  arrowIcon: {paddingHorizontal: 5},
  buttonText: {textAlign: 'center', color: 'white', fontWeight: 'bold'},
  text: {flex: 1, padding: 5, flexDirection: 'row'},
  section: {flexDirection: 'row', alignItems: 'center'},
  textInput: {color: 'black', flex: 1},
  toMyProfile: {
    borderRadius: 25,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 3,
    flexDirection: 'row',
  },
  buttonContainer: {flex: 1},
  buttonsContainer: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#0253aa',
    borderRadius: 20,
  },
});
