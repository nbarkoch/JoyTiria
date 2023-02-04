import React, {FC, memo, useCallback, useEffect, useRef} from 'react';
import {
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {View} from 'react-native';
import {
  Announcement,
  useCurrentUser,
  useCurrentWorld,
  useKeyboard,
  useSelectionProgress,
} from '../../utils/store';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/Ionicons';

import NewMessage from './newMessage';
import Message from './message';
import {useNavigation} from '@react-navigation/native';
import {TabsNavigationProp} from '../../navigation';

const ICON_SIZE = 35;

const AnnouncementsTab: FC = ({}) => {
  const announcements = useCurrentWorld(
    state => state.currentWorld?.announcements,
  );
  const isAdmin = useCurrentWorld(state => state.currentWorld?.isAdmin);
  const currentWorldRef = useCurrentUser(state => state.user?.currentWorldRef);

  const flatListRef = useRef<FlatList>(null);
  const closeToEnd = useRef<boolean>(true);
  const flatListHeight = useRef<number | undefined>(undefined);
  const keyboardOffset = useKeyboard(state => state.height);

  const setSelectionProgress = useSelectionProgress(state => state.setProgress);
  const deleteProgress = useSelectionProgress(state => state.deleteActivated);
  const setDeleteProgress = useSelectionProgress(state => state.setDeleteState);

  const scrollToEnd = useCallback(() => {
    if (closeToEnd.current) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: false});
        clearTimeout(timer);
      }, 100);
    }
  }, [flatListRef]);

  useEffect(() => {
    if (keyboardOffset !== undefined) {
      scrollToEnd();
    }
  }, [keyboardOffset, scrollToEnd]);

  useEffect(() => {
    if (deleteProgress) {
      currentWorldRef?.update({
        announcements: announcements?.filter(m => m.selected !== true),
      });
      setDeleteProgress(false);
    }
    announcements?.forEach(
      (_, index) => (announcements[index].selected = null),
    );
    setSelectionProgress(false);
  }, [
    announcements,
    currentWorldRef,
    deleteProgress,
    setDeleteProgress,
    setSelectionProgress,
  ]);

  const setAnnouncementState = useCallback(
    (index: number, selected: boolean) => {
      if (announcements !== undefined) {
        announcements[index].selected = selected;
      }
    },
    [announcements],
  );

  if (announcements === undefined) {
    return (
      <View style={styles.loadingState}>
        <Text style={styles.loadingText}>Loading</Text>
      </View>
    );
  }

  if (announcements.length === 0) {
    return (
      <View style={styles.loadingState}>
        <Text style={styles.loadingText}>
          Currently, there are no announcements
        </Text>
      </View>
    );
  }

  function renderItem({item, index}: {item: Announcement; index: number}) {
    const date = dayjs(item.date.toDate());
    const displayDate =
      index === 0 ||
      date.format('DD.MM.YYYY') !==
        dayjs(announcements![index - 1].date.toDate()).format('DD.MM.YYYY');

    return (
      <>
        {displayDate && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>
              {date.format('DD.MM.YYYY')}
            </Text>
          </View>
        )}
        <Message
          message={item.message}
          senderRef={item.by}
          time={date.format('HH:mm')}
          selected={item.selected ?? false}
          index={index}
          setAnnouncementSelected={selected =>
            setAnnouncementState(index, selected)
          }
        />
      </>
    );
  }

  const keyboardStyle = {
    ...(keyboardOffset !== undefined
      ? {
          height:
            (flatListHeight.current ?? 0) +
            ICON_SIZE +
            (Platform.OS === 'ios' ? 50 : -50) -
            keyboardOffset,
          flexGrow: 0,
        }
      : {flex: 1}),
  };

  const containerStyle =
    Platform.OS === 'android' && keyboardOffset !== undefined
      ? {}
      : styles.container;

  return (
    <KeyboardAvoidingView behavior="padding" style={containerStyle}>
      <FlatList
        onLayout={event => {
          if (flatListHeight.current === undefined) {
            flatListHeight.current = event.nativeEvent.layout.height;
          }
        }}
        ref={flatListRef}
        style={[styles.tabContainer, keyboardStyle]}
        data={announcements}
        renderItem={renderItem}
        onContentSizeChange={scrollToEnd}
        onScroll={event => {
          closeToEnd.current =
            event.nativeEvent.contentSize.height -
              event.nativeEvent.contentOffset.y -
              event.nativeEvent.layoutMeasurement.height <
            80;
        }}
      />
      {Boolean(isAdmin) && <NewMessage />}
    </KeyboardAvoidingView>
  );
};

export const AnnouncementsTabHeaderLeft = () => {
  const isSelectionProgress = useSelectionProgress(state => state.inProgress);
  const setSelectionProgress = useSelectionProgress(state => state.setProgress);
  const navigation = useNavigation<TabsNavigationProp>();

  const handleBackButtonClick = useCallback(() => {
    if (
      isSelectionProgress &&
      navigation.getState().routeNames[navigation.getState().index] ===
        'Announcements'
    ) {
      setSelectionProgress(false);
      return true;
    }
    return false;
  }, [isSelectionProgress, setSelectionProgress, navigation]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, [handleBackButtonClick]);

  if (isSelectionProgress) {
    return (
      <TouchableOpacity onPress={() => setSelectionProgress(false)}>
        <Icon name={'chevron-back'} size={30} color={'grey'} />
      </TouchableOpacity>
    );
  }
  return <></>;
};

export const AnnouncementsTabHeaderRight = () => {
  const isSelectionProgress = useSelectionProgress(state => state.inProgress);
  const setDeleteSelected = useSelectionProgress(state => state.setDeleteState);
  if (isSelectionProgress) {
    return (
      <TouchableOpacity onPress={() => setDeleteSelected(true)}>
        <Icon name={'trash'} size={30} color={'grey'} />
      </TouchableOpacity>
    );
  }
  return <></>;
};

export default memo(AnnouncementsTab);

const styles = StyleSheet.create({
  container: {flex: 1},
  tabContainer: {backgroundColor: '#405C93'},
  dateHeader: {
    backgroundColor: '#FFFFFF99',
    borderRadius: 5,
    padding: 5,
    marginTop: 10,
    marginHorizontal: 5,
  },
  dateHeaderText: {
    textAlign: 'center',
    color: 'black',
  },
  loadingState: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
  },

  loadingText: {color: '#777f'},
});
