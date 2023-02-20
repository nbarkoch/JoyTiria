import {isNil, isUndefined} from 'lodash';
import React, {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  Player,
  useCurrentWorld,
  UserPreview,
  useSnackbar,
  WorldPreview,
} from '../../utils/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {useCallback, useEffect, useRef, useState} from 'react';
import Animated from 'react-native-reanimated';
import storage from '@react-native-firebase/storage';
import QueriedImage from '../../utils/components/queriedImage';
import WorldsCollapsible from './worldsCollapsed';

const IMAGE_PROFILE_PATH = 'image_profiles';

const Liner = () => {
  return <View style={userStyle.liner} />;
};

interface ProfileHeaderProps {
  user: UserPreview;
  player?: Player;
  jumpToPlayer: () => void;
  setCurrentUser: () => void;
  isCurrentUser: boolean;
  worldsPreview?: WorldPreview[];
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
  const {name, ref, image, worlds: worldsPreview} = user;
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

  const setSnackbar = useSnackbar(state => state.setSnackbar);

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

  const setUserImage = async (uri: string): Promise<boolean> => {
    try {
      user.ref.update({image: {uri}});
      return Promise.resolve(true);
    } catch (error) {
      console.error(error as Error);
    }
    return Promise.resolve(false);
  };

  const uploadImageToStorage = async (imageAsset: Asset) => {
    if (!isUndefined(imageAsset.uri) && !isUndefined(imageAsset.type)) {
      const storageRef = storage().ref();
      const imageRef = storageRef.child(`${IMAGE_PROFILE_PATH}/${user.ref.id}`);
      const uploadTask = imageRef.putFile(imageAsset.uri, {
        contentType: imageAsset.type,
      });

      uploadTask.on(
        storage.TaskEvent.STATE_CHANGED,
        snapshot => {
          const progress = `${(
            (snapshot.bytesTransferred / snapshot.totalBytes) *
            100
          ).toFixed(2)}% done`;
          console.log(progress);
          switch (snapshot.state) {
            case storage.TaskState.PAUSED:
              setSnackbar({
                text: `Upload is paused (${progress})`,
              });
              break;
            case storage.TaskState.RUNNING:
              setSnackbar({
                text: `Upload is running (${progress})`,
              });
              break;
          }
        },
        error => {
          console.error(error as Error);
          setSnackbar({
            text: 'An error occurred while uploading..',
          });
        },
      );

      uploadTask.then(async () => {
        const downloadURL = await uploadTask.snapshot?.ref.getDownloadURL();
        if (downloadURL) {
          const success = await setUserImage(downloadURL);
          if (success) {
            setSnackbar({
              text: 'Image uploaded successfully',
            });
          }
        }
      });
    }
  };
  const handleImagePicker = async () => {
    try {
      const response = await launchImageLibrary({mediaType: 'photo'});
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const newImg =
          !isUndefined(response.assets) && !isUndefined(response.assets[0])
            ? response.assets[0]
            : undefined;
        if (!isUndefined(newImg)) {
          uploadImageToStorage(newImg);
        }
      }
    } catch (error) {
      console.error(error as Error);
      setSnackbar({
        text: 'An error occurred while taking the photo..',
      });
    }
  };

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
      <View style={userStyle.imageContainer}>
        <QueriedImage style={userStyle.image} source={image} />
        {isCurrentUser && (
          <TouchableOpacity
            onPress={handleImagePicker}
            style={userStyle.addImageButton}>
            <Icon name={'add'} size={30} color="grey" />
          </TouchableOpacity>
        )}
      </View>

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

      <WorldsCollapsible id={ref.id} worldsPreview={worldsPreview ?? []} />
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
              <Text style={userStyle.buttonText}>{'See Your Profile'}</Text>
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
  imageContainer: {
    alignSelf: 'center',
    padding: 20,
  },
  image: {
    height: 200,
    width: 200,
    alignSelf: 'center',
    borderRadius: 20,
    zIndex: -1,
    borderColor: 'grey',
    borderWidth: 2,
  },
  userInfo: {
    borderColor: 'grey',
    borderRadius: 5,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
    marginHorizontal: 10,
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
  text: {flex: 1, padding: 5, flexDirection: 'row', flexWrap: 'wrap'},
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
    borderRadius: 17.5,
    marginTop: 20,
    marginBottom: 5,
    marginHorizontal: 10,
  },
  addImageButton: {
    position: 'absolute',
    bottom: 0,
    width: 50,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'grey',
  },
});
