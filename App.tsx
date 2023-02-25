import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './screens/loginScreen';
import HomeScreen from './screens/homeScreen';
import RegisterScreen from './screens/registerScreen';
import {RootStackParamList} from './navigation';
import {SafeAreaView, useColorScheme} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Dialog from './dialogs/dialog';
import {QueryClient, QueryClientProvider} from 'react-query';
import {useTranslate} from './languages/translations';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const {t} = useTranslate();
  const isDarkMode = useColorScheme() === 'dark';
  const queryClient = new QueryClient();
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={backgroundStyle}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name={'Login'}
              options={{
                title: `${t('LOGIN_TITLE')}`,
              }}
              component={LoginScreen}
            />
            <Stack.Screen
              name="Register"
              options={{
                title: `${t('REGISTER_TITLE')}`,
              }}
              component={RegisterScreen}
            />
            <Stack.Screen
              options={{headerShown: false, title: `${t('HOME_TITLE')}`}}
              name="Home"
              component={HomeScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
      <Dialog />
    </QueryClientProvider>
  );
};

export default App;
