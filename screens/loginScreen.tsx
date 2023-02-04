import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Animated, {FadeInDown, FadeOutDown} from 'react-native-reanimated';

import Icon from 'react-native-vector-icons/Ionicons';

import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {ProfileScreenNavigationProp} from '../navigation';
import {Error, getErrorMessage} from '../utils/firebase';

import AsyncStorage from '@react-native-async-storage/async-storage';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {useCurrentUser} from '../utils/store';

function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [checkbox, setCheckbox] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const removeCurrentUser = useCurrentUser(state => state.removeUser);
  const onPressRegister = () => {
    navigation.navigate('Register');
  };

  useEffect(() => {
    AsyncStorage.getItem('@login_user').then(jsonValue => {
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      if (user !== null) {
        setEmail(user.email);
        setPass(user.pass);
        setCheckbox(true);
      }
    });
  }, [removeCurrentUser]);

  const onPressLogin = async () => {
    try {
      const userCredentials = await auth().signInWithEmailAndPassword(
        email,
        pass,
      );

      const user = userCredentials.user;
      console.info('login pressed');
      if (user.email) {
        if (checkbox) {
          const jsonValue = JSON.stringify({email: email, pass: pass});
          await AsyncStorage.setItem('@login_user', jsonValue);
        } else {
          await AsyncStorage.removeItem('@login_user');
        }
        console.info('login successfully');
        navigation.navigate('Home', {email: user.email});
      }
    } catch (error) {
      const timeout = setTimeout(() => {
        setErrorMessage(null);
        clearTimeout(timeout);
      }, 5000);
      setErrorMessage(getErrorMessage((error as Error).code));
    }
  };

  const loginDisabled = email === '' || pass === '';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexOne}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -90}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.textInputContainer}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            autoCorrect={false}
            style={!errorMessage ? styles.textInput : styles.invalidTextInput}
            placeholderTextColor={'#AAAA'}
          />
        </View>
        <View style={styles.textInputContainer}>
          <TextInput
            value={pass}
            onChangeText={setPass}
            placeholder="Password"
            secureTextEntry
            autoCorrect={false}
            style={!errorMessage ? styles.textInput : styles.invalidTextInput}
            placeholderTextColor={'#AAAA'}
          />
        </View>

        {errorMessage && (
          <Animated.View
            style={styles.alertContainer}
            entering={FadeInDown.duration(400)}
            exiting={FadeOutDown}>
            <Icon name="alert-circle-outline" size={30} color="#900" />
            <Text style={styles.alertText}>{errorMessage}</Text>
          </Animated.View>
        )}

        <View style={styles.BouncyCheckbox}>
          <BouncyCheckbox
            disableBuiltInState={true}
            isChecked={checkbox}
            fillColor="#03A9F4"
            onPress={() => setCheckbox(!checkbox)}
          />
          <Text style={styles.CheckboxText}>remember me</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            disabled={loginDisabled}
            style={
              loginDisabled ? styles.disabledButtonLogin : styles.buttonLogin
            }
            onPress={onPressLogin}>
            <Text style={styles.loginText}>login</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.buttonRegister}
            onPress={onPressRegister}>
            <Text style={styles.registerText}>register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexOne: {flex: 1},
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {padding: 5, width: '80%'},
  buttonContainer: {padding: 5, width: '55%'},
  buttonLogin: {
    backgroundColor: '#03A9F4',
    padding: 11,
    borderColor: '#03A9F4',
    borderWidth: 3,
    borderRadius: 18,
  },
  disabledButtonLogin: {
    backgroundColor: '#b2ccd7',
    padding: 11,
    borderColor: '#b2ccd7',
    borderWidth: 3,
    borderRadius: 18,
  },
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
  liner: {height: 10},
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    width: '80%',
    backgroundColor: '#F7F7F7',
    borderRadius: 25,
    paddingHorizontal: 8,
  },
  alertText: {color: '#900', paddingHorizontal: 5},
  BouncyCheckbox: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  CheckboxText: {color: '#555555', fontWeight: '500'},
});

export default LoginScreen;
