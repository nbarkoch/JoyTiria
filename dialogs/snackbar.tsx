import {isNull, isUndefined} from 'lodash';
import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import Animated, {SlideInDown, SlideOutDown} from 'react-native-reanimated';
// import Icon from 'react-native-vector-icons/Ionicons';
import {useSnackbar} from '../utils/store';

const SNACKBAR_TIMEOUT = 5000;
function Snackbar() {
  const snackbar = useSnackbar(state => state.snackbar);
  const clearSnackbar = useSnackbar(
    state => () => state.setSnackbar(undefined),
  );

  const timeout = useRef<number | null>(null);

  const setTimer = useCallback(() => {
    if (!isNull(timeout.current)) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      clearSnackbar();
      if (!isNull(timeout.current)) {
        clearTimeout(timeout.current);
      }
    }, SNACKBAR_TIMEOUT);
  }, [clearSnackbar]);

  const clearTimer = () => {
    if (!isNull(timeout.current)) {
      clearTimeout(timeout.current);
    }
  };

  useEffect(() => {
    setTimer();
  }, [setTimer, snackbar]);

  if (isUndefined(snackbar)) {
    return <></>;
  }

  return (
    <View style={styles.snackbarBackground}>
      <Animated.View
        entering={SlideInDown.duration(1000)}
        exiting={SlideOutDown.duration(1000)}
        style={[styles.snackbarContainer]}>
        <TouchableWithoutFeedback onPressIn={clearTimer} onPressOut={setTimer}>
          <Text style={styles.text}>{snackbar.text}</Text>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
}

export default Snackbar;

const styles = StyleSheet.create({
  snackbarBackground: {
    position: 'absolute',
    justifyContent: 'flex-end',
    bottom: 0,
    width: '100%',
  },
  text: {color: 'white'},
  snackbarContainer: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 20,
    margin: 12,
    borderWidth: 2,
    borderColor: 'grey',
  },
});
