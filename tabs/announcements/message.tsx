import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableWithoutFeedback} from 'react-native';
import {View} from 'react-native';
import {
  DocRef,
  useCurrentWorld,
  User,
  useSelectionProgress,
} from '../../utils/store';

import {useQuery} from 'react-query';

interface MessageProps {
  message: string;
  time: string;
  senderRef: DocRef;
  selected: boolean;
  index: number;
  setAnnouncementSelected: (selected: boolean) => void;
}

const Message: FC<MessageProps> = React.memo(
  ({message, time, senderRef, index, setAnnouncementSelected}) => {
    const [selected, setSelected] = useState<boolean>(false);
    const isAdmin = useCurrentWorld(state => state.currentWorld?.isAdmin);
    const setIsSelectionProgress = useSelectionProgress(
      state => state.setProgress,
    );

    const {data: user} = useQuery<User | undefined, Error>(
      ['USER', {id: senderRef.id}],
      async () => {
        const response = await senderRef.get();
        return response.data() as User | undefined;
      },
    );

    const inSelectProgress = useSelectionProgress(state => state.inProgress);

    const onMessagePress = () => {
      if (inSelectProgress) {
        setIsSelectionProgress(true);
        setSelected(!selected && inSelectProgress);
        setAnnouncementSelected(!selected && inSelectProgress);
      }
    };

    const onMessageLongPress = () => {
      if (!inSelectProgress) {
        setSelected(true);
        setAnnouncementSelected(true);
      }
      setIsSelectionProgress(!inSelectProgress);
    };

    useEffect(() => {
      if (!inSelectProgress) {
        setSelected(false);
        setIsSelectionProgress(false);
      }
    }, [inSelectProgress, index, setIsSelectionProgress]);

    const backgroundColor = {backgroundColor: selected ? '#ffffdd' : 'white'};

    const TouchableProps = isAdmin
      ? {
          onPress: onMessagePress,
          onLongPress: onMessageLongPress,
        }
      : {};

    return (
      <TouchableWithoutFeedback {...TouchableProps}>
        <View style={[styles.messageContainer, backgroundColor]}>
          <Text style={styles.sender}>{user?.name}</Text>
          <Text style={styles.content}>{message}</Text>
          <Text style={styles.date}>{time}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  },
);

export default Message;

const styles = StyleSheet.create({
  messageContainer: {
    margin: 5,
    padding: 10,
    borderRadius: 10,
  },
  sender: {fontSize: 14, fontWeight: 'bold', color: '#222f', textAlign: 'left'},
  content: {padding: 5, fontSize: 20, color: '#333f', textAlign: 'left'},
  date: {fontSize: 14, color: '#222f', textAlign: 'right'},
});
