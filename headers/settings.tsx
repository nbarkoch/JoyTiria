import React, {useCallback, useMemo, useState} from 'react';
import Animated, {FadeInUp, FadeOutUp} from 'react-native-reanimated';

import {
  I18nManager,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TextPicker from './textPicker';
import i18n from '../languages/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';

interface SettingsProps {
  onClose: () => void;
}

type Language = {
  key: string;
  value: string;
};

function Settings({onClose}: SettingsProps) {
  const {t} = useTranslation();
  const [isDarkModeEnabled, setDarkModeEnabled] = useState<boolean>(false);
  const toggleSwitch = () => {
    setDarkModeEnabled(!isDarkModeEnabled);
  };

  const onLangSelect = useCallback(async (lang: Language) => {
    await i18n.changeLanguage(lang.key);
    if (i18n.t('isRTL')) {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
    }
    await AsyncStorage.setItem('@language', lang.key);
    // RNRestart.Restart();
  }, []);

  const languages: Array<Language> = useMemo(() => {
    const langs = i18n.options.resources;
    const langNames = [];
    for (const lang in langs) {
      langNames.push({
        key: lang,
        value: i18n.t(`LANGUAGES.${lang.toUpperCase()}` as any),
      });
    }
    return langNames;
  }, []);

  return (
    <Animated.View
      style={styles.container}
      entering={FadeInUp}
      exiting={FadeOutUp}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name={'close'} size={20} />
      </TouchableOpacity>
      <View style={styles.section}>
        <Text style={styles.textNormal}>{t('DARK_MODE')}</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isDarkModeEnabled ? '#8fefff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isDarkModeEnabled}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.textNormal}>{t('LANGUAGE')}</Text>
        <TextPicker
          defaultValue={languages.find(l => l.key === i18n.language)}
          data={languages}
          onSelect={onLangSelect}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#efefefff',
    flex: 1,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    padding: 5,
  },
  closeButton: {padding: 12},
  section: {
    backgroundColor: '#eaeaeaff',
    margin: 5,
    borderRadius: 15,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textNormal: {
    fontSize: 17,
    flex: 1,
    paddingVertical: 5,
    textAlign: 'left',
    color: '#555555',
  },
});

export default Settings;
