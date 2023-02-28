import React, {useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import {getErrorMessage} from '../utils/firebase';
import {useNavigation} from '@react-navigation/native';
import {ProfileScreenNavigationProp} from '../navigation';
import firestore from '@react-native-firebase/firestore';

import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {SlideInDown, SlideOutUp} from 'react-native-reanimated';
import {useTranslate} from '../languages/translations';

const Liner = () => <View style={styles.liner} />;

function RegisterScreen() {
  const {t} = useTranslate();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [passRep, setPassRep] = useState<string>('');

  const [nameErrMsg, setNameErrMsg] = useState<string | null>(null);
  const [emailErrMsg, setEmailErrMsg] = useState<string | null>(null);
  const [passErrMsg, setPassErrMsg] = useState<string | null>(null);
  const [passErrMsg2, setPassErrMsg2] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  async function updateNameIfExits() {
    const userDocument = firestore()
      .collection('Users')
      .doc(email.toLowerCase());
    const userExists = (await userDocument.get()).exists;
    if (userExists) {
      userDocument.update({name: name});
    } else {
      userDocument.set({name: name});
    }
  }

  const onRegisterPress = async () => {
    Keyboard.dismiss();
    setGeneralError(null);
    let fieldsAreValid: boolean = true;
    if (name.length < 2) {
      setNameErrMsg(t('REGISTER.NAME_TOO_SHORT'));
      fieldsAreValid = false;
    } else {
      setNameErrMsg(null);
    }
    if (email.length < 4) {
      setEmailErrMsg(t('REGISTER.EMAIL_TOO_SHORT'));
      fieldsAreValid = false;
    } else {
      setEmailErrMsg(null);
    }
    if (pass.length < 3 || passRep.length < 3) {
      setPassErrMsg(t('REGISTER.PASSWORD_TOO_SHORT'));
      fieldsAreValid = false;
    } else {
      setPassErrMsg(null);
    }
    if (pass !== passRep) {
      setPassErrMsg2(t('REGISTER.PASSWORD_NOT_MATCH'));
      fieldsAreValid = false;
    } else {
      setPassErrMsg2(null);
    }

    if (!fieldsAreValid) {
      return;
    }
    try {
      await auth().createUserWithEmailAndPassword(email.toLowerCase(), pass);
      setRegisterSuccess(true);
      updateNameIfExits();
      Keyboard.dismiss();
    } catch (error: any) {
      console.error(error);
      const errorMassage = getErrorMessage(error.code);
      switch (error.code) {
        case 'auth/email-already-in-use':
        case 'auth/invalid-email':
          setEmailErrMsg(errorMassage);
          break;
        case 'auth/weak-password':
          setPassErrMsg(errorMassage);
          break;
        case 'auth/internal-error':
          setGeneralError(errorMassage);
      }
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        enabled
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexOne}>
        <ScrollView contentContainerStyle={styles.containerStyle}>
          <Animated.View style={styles.container} exiting={SlideOutUp}>
            <Liner />
            <View style={styles.textInputContainer}>
              <Text
                style={
                  !nameErrMsg ? styles.textInputTop : styles.textInputTopError
                }>
                {t('REGISTER.NAME')}
              </Text>
              <TextInput
                style={!nameErrMsg ? styles.textInput : styles.invalidTextInput}
                autoCorrect={false}
                onChangeText={text => {
                  setName(text);
                  setNameErrMsg(null);
                }}
              />
              {nameErrMsg && <Text style={styles.alertText}>{nameErrMsg}</Text>}
            </View>
            <View style={styles.textInputContainer}>
              <Text
                style={
                  !emailErrMsg ? styles.textInputTop : styles.textInputTopError
                }>
                {t('REGISTER.EMAIL')}
              </Text>
              <TextInput
                style={
                  !emailErrMsg ? styles.textInput : styles.invalidTextInput
                }
                autoCorrect={false}
                onChangeText={text => {
                  setEmail(text);
                  setEmailErrMsg(null);
                }}
              />
              {emailErrMsg && (
                <Text style={styles.alertText}>{emailErrMsg}</Text>
              )}
            </View>
            <Liner />
            <View style={styles.textInputContainer}>
              <Text
                style={
                  !passErrMsg && !passErrMsg2
                    ? styles.textInputTop
                    : styles.textInputTopError
                }>
                {t('REGISTER.PASSWORD')}
              </Text>
              <TextInput
                style={
                  !passErrMsg && !passErrMsg2
                    ? styles.textInput
                    : styles.invalidTextInput
                }
                returnKeyType="go"
                secureTextEntry
                autoCorrect={false}
                onChangeText={text => {
                  setPass(text);
                  setPassErrMsg(null);
                  setPassErrMsg2(null);
                }}
              />
            </View>
            <View style={styles.textInputContainer}>
              <Text
                style={
                  !passErrMsg && !passErrMsg2
                    ? styles.textInputTop
                    : styles.textInputTopError
                }>
                {t('REGISTER.REPEAT_PASSWORD')}
              </Text>
              <TextInput
                style={
                  !passErrMsg && !passErrMsg2
                    ? styles.textInput
                    : styles.invalidTextInput
                }
                returnKeyType="go"
                secureTextEntry
                autoCorrect={false}
                onChangeText={text => {
                  setPassRep(text);
                  setPassErrMsg(null);
                  setPassErrMsg2(null);
                }}
              />
              {passErrMsg && <Text style={styles.alertText}>{passErrMsg}</Text>}
              {passErrMsg2 && (
                <Text style={styles.alertText}>{passErrMsg2}</Text>
              )}
            </View>
            <Liner />

            {generalError && (
              <Text style={styles.alertText}>{generalError}</Text>
            )}
            <Liner />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.buttonRegister}
                onPress={onRegisterPress}>
                <Text style={styles.registerText}>{t('REGISTER.CREATE')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      {registerSuccess && (
        <Animated.View
          style={styles.successScreen}
          entering={SlideInDown}
          exiting={SlideOutUp}>
          <View style={styles.imageContainer}>
            <View style={styles.imageContainer} />
            <Icon
              name="ios-checkmark-circle-outline"
              size={150}
              color={'#00d084'}
            />
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              {t('REGISTER.WELCOME', {name})}
            </Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                navigation.goBack();
              }}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
    fontSize: 18,
    borderColor: 'white',
    borderWidth: 0.5,
    color: 'black',
  },
  invalidTextInput: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
    fontSize: 18,
    borderColor: '#900',
    borderWidth: 0.5,
  },
  textInputTop: {
    padding: 3,
    color: 'grey',
    fontWeight: '400',
    textAlign: 'left',
  },
  textInputTopError: {padding: 3, color: '#900', fontWeight: '400'},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    padding: 5,
    width: '80%',
  },
  buttonContainer: {padding: 5, width: '55%'},
  buttonLogin: {
    backgroundColor: '#03A9F4',
    padding: 11,
    borderColor: '#03A9F4',
    borderWidth: 3,
    borderRadius: 18,
  },
  flexOne: {flex: 1},
  buttonRegister: {
    backgroundColor: 'white',
    padding: 11,
    borderColor: '#03A9F4',
    borderWidth: 3,
    borderRadius: 18,
  },
  loginText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 17,
  },
  registerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#03A9F4',
    fontSize: 17,
  },
  liner: {height: 20},
  alertText: {color: '#900', paddingTop: 2, paddingHorizontal: 7},

  welcomeText: {
    color: 'grey',
    fontSize: 20,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  doneButton: {
    backgroundColor: '#03A9F4',
    paddingVertical: 11,
    paddingHorizontal: 40,
    alignSelf: 'center',
    borderColor: '#03A9F4',
    borderWidth: 3,
    borderRadius: 18,
  },
  doneText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 17,
  },
  imageContainer: {flex: 1},
  welcomeContainer: {flex: 1},
  successScreen: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  containerStyle: {paddingTop: 100},
});

export default RegisterScreen;
