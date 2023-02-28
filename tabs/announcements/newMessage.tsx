import React, {FC, useRef, useState} from 'react';
import {
  I18nManager,
  StyleProp,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import {View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {firebase} from '@react-native-firebase/firestore';
import {useCurrentUser, useCurrentWorld, User} from '../../utils/store';

const ICON_SIZE = 35;

interface NewMessageProps {
  scrollToBottom?: () => void;
  style?: StyleProp<ViewStyle>;
}

const NewMessage: FC<NewMessageProps> = ({scrollToBottom = () => {}}) => {
  const [message, setMessage] = useState<string>('');
  const sendDisabled = message === '';
  const announcements = useCurrentWorld(
    state => state.currentWorld?.announcements,
  );
  const currentUser: User | undefined = useCurrentUser(state => state.user);

  const textInputRef = useRef<TextInput>(null);

  const sendMessage = () => {
    if (currentUser !== undefined && announcements !== undefined) {
      announcements.push({
        by: currentUser.ref,
        message: message,
        date: firebase.firestore.Timestamp.fromDate(new Date()),
        selected: null,
      });
      currentUser.currentWorldRef
        ?.update({
          announcements: announcements,
        })
        .then(() => {
          setMessage('');
          scrollToBottom();
        });
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        textInputRef.current?.focus();
      }}>
      <View style={[styles.newMessageContainer]}>
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          onChangeText={setMessage}>
          {message}
        </TextInput>
        <TouchableOpacity>
          <Icon
            disabled={sendDisabled}
            onPress={sendMessage}
            name="send"
            size={ICON_SIZE}
            color={sendDisabled ? '#55555555' : '#555555'}
            style={[
              styles.iconButton,
              I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : {},
            ]}
          />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default NewMessage;

const styles = StyleSheet.create({
  newMessageContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    multiline: true,
    numberOfLines: 5,
    textAlignVertical: 'top',
    blurOnSubmit: false,
    color: '#333f',
    fontSize: 18,
  },
  iconButton: {paddingVertical: 5, paddingHorizontal: 10},
});
