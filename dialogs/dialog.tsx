import {isUndefined} from 'lodash';
import React, {useCallback} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {FadeInDown, FadeOutDown} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslate} from '../languages/translations';
import {useDialog} from '../utils/store';

const {width} = Dimensions.get('screen');

function Dialog() {
  const dialog = useDialog(state => state.dialog);
  const setDialog = useDialog(state => state.setDialog);
  const decline = useCallback(() => {
    if (dialog && dialog.onDecline) {
      dialog.onDecline();
    }
    setDialog(undefined);
  }, [dialog, setDialog]);

  const {t} = useTranslate();

  const submit = useCallback(() => {
    if (dialog && dialog.onSubmit) {
      dialog.onSubmit();
      setDialog(undefined);
    }
  }, [dialog, setDialog]);

  if (isUndefined(dialog)) {
    return <></>;
  }

  return (
    <TouchableWithoutFeedback style={styles.flexOne} onPress={decline}>
      <View style={styles.dialogBackground}>
        <TouchableWithoutFeedback>
          <Animated.View
            entering={FadeInDown.duration(400)}
            exiting={FadeOutDown}
            style={[
              styles.dialogContainer,
              {minWidth: width - 150, maxWidth: width - 20},
            ]}>
            {!isUndefined(dialog.icon) && (
              <Icon name={dialog.icon} size={30} color="#900" />
            )}
            {!isUndefined(dialog.title) && (
              <Text style={styles.title}>{dialog.title}</Text>
            )}
            <Text style={styles.message}>{dialog.message}</Text>
            {!isUndefined(dialog.onSubmit) && (
              <View style={styles.rowStyle}>
                <TouchableOpacity style={styles.cancelButton} onPress={decline}>
                  <Text style={styles.cancelButtonText}>
                    {t('DIALOG.CANCEL')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={submit}>
                  <Text style={styles.submitButtonText}>
                    {t('DIALOG.SUBMIT')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default Dialog;

const styles = StyleSheet.create({
  dialogBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1114',
  },
  flexOne: {width: '100%', height: '100%'},

  dialogContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 20,
  },
  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
  },
  title: {padding: 10, textAlign: 'center', color: 'black', fontWeight: 'bold'},
  message: {padding: 10, textAlign: 'center', color: 'black'},
  cancelButton: {backgroundColor: 'white', borderRadius: 12, padding: 13},
  cancelButtonText: {color: '#0693e3', fontWeight: 'bold'},
  submitButton: {backgroundColor: '#0693e3', borderRadius: 12, padding: 13},
  submitButtonText: {color: 'white', fontWeight: 'bold'},
});
