import {isNil, isUndefined} from 'lodash';
import React, {Image, StyleSheet, Text, View} from 'react-native';
import {Player, useCurrentWorld, User} from '../../utils/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TextInput, TouchableOpacity} from 'react-native-gesture-handler';

import LinearGradient from 'react-native-linear-gradient';
import {useCallback, useState} from 'react';

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
}: ProfileHeaderProps): JSX.Element => {
  const {name, ref, image} = user;
  const [score, pendingScore] = player
    ? [player.score, player.pendingScoreGroup]
    : [0];
  const isAdmin = useCurrentWorld(state => state.currentWorld?.isAdmin);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>(name);

  const setNewName = useCallback((newName: string) => {}, []);
  return (
    <View style={userStyle.container}>
      <Image
        style={userStyle.image}
        source={image !== undefined ? image : DEFAULT_IMAGE}
      />
      <View style={userStyle.userInfo}>
        <View style={userStyle.section}>
          <Text style={userStyle.text}>
            <Text style={userStyle.key}>{'Name: '}</Text>
            {editMode ? (
              <TextInput
                style={userStyle.textInput}
                value={textInput}
                onChangeText={value => {
                  setTextInput(value);
                }}
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
              </>
            )}
          </Text>

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
      {!isUndefined(player) && (
        <TouchableOpacity onPress={jumpToPlayer}>
          <LinearGradient
            style={userStyle.button}
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
    </View>
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
    backgroundColor: 'red',
    borderRadius: 15,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    flexDirection: 'row',
  },
  arrowIcon: {paddingHorizontal: 5},
  buttonText: {textAlign: 'center', color: 'white', fontWeight: 'bold'},
  text: {flex: 1, padding: 5},
  section: {flexDirection: 'row', alignItems: 'center'},
  textInput: {color: 'black'},
});
