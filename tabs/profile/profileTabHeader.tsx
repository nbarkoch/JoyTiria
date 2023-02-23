import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from 'react-native';

import {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';

import Icon from 'react-native-vector-icons/Ionicons';

import {useCurrentUser, useProfile} from '../../utils/store';
import {isUndefined} from 'lodash';

const ProfileTabHeader = (): BottomTabNavigationOptions => {
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const textInputRef = useRef<TextInput>(null);
  const curUserId = useCurrentUser(state => state.user?.ref.id);
  const userProfileId = useProfile(state => state.userProfileId);
  const setUserProfileId = useProfile(state => state.setUserProfileId);

  const searchFor = useCallback(
    (text: string) => {
      setUserProfileId(text);
    },
    [setUserProfileId],
  );

  const handleBackButtonClick = useCallback(() => {
    setSearchActive(false);
    if (!isUndefined(curUserId)) {
      searchFor(curUserId);
    }
    setValue('');
    return false;
  }, [curUserId, searchFor]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, [handleBackButtonClick]);

  useEffect(() => {
    if (
      searchActive &&
      userProfileId !== undefined &&
      userProfileId.length > 0 &&
      !textInputRef.current?.isFocused()
    ) {
      setValue(userProfileId);
    }
  }, [searchActive, userProfileId]);

  useEffect(() => {
    if (searchActive) {
      const timeout = setTimeout(() => {
        textInputRef.current?.focus();
        clearTimeout(timeout);
      }, 100);
    } else {
      textInputRef.current?.blur();
    }
  }, [searchActive]);

  const header = () => {
    return (
      <View style={styles.headerOptions}>
        <TouchableOpacity onPress={handleBackButtonClick} style={styles.icon}>
          <Icon name={'arrow-back'} size={30} color="grey" />
        </TouchableOpacity>
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          value={value}
          autoCorrect={false}
          autoCapitalize="none"
          placeholder={'Enter email address'}
          placeholderTextColor={'gray'}
          onChangeText={setValue}
          returnKeyType={'search'}
          onSubmitEditing={event => searchFor(event.nativeEvent.text)}
          multiline={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => setValue('')} style={styles.icon}>
            <Icon name={'close'} size={30} color="grey" />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  const headerRight = () => {
    return (
      <TouchableOpacity
        onPress={() => setSearchActive(true)}
        style={styles.headerRight}>
        <Icon name={'search'} size={30} color="grey" />
      </TouchableOpacity>
    );
  };
  return searchActive ? {header: header} : {headerRight: headerRight};
};

const styles = StyleSheet.create({
  headerOptions: {
    padding: 10,
    flexDirection: 'row',
  },
  textInput: {flex: 1, paddingHorizontal: 5, fontSize: 18},
  icon: {paddingHorizontal: 5},
  headerRight: {justifyContent: 'center', alignItems: 'center', padding: 5},
});

export default ProfileTabHeader;