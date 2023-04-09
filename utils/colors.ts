import {useColorScheme} from 'react-native';

export class Theme {
  regularText: string;
  text: string;
  regularBlue: string;
  simpleBackgroundColor: string;
  backgroundColor: string;
  white: 'white';
  black: 'black';
  blueBackground: string;
  error: string;
  warning: string;
  grey: string;

  constructor(theme: {
    regularText: string;
    text: string;
    regularBlue: string;
    simpleBackgroundColor: string;
    backgroundColor: string;
    blueBackground: string;
    error: string;
    warning: string;
    grey: string;
  }) {
    this.regularText = theme.regularText;
    this.text = theme.text;
    this.regularBlue = theme.regularBlue;
    this.simpleBackgroundColor = theme.simpleBackgroundColor;
    this.backgroundColor = theme.backgroundColor;
    this.white = 'white';
    this.black = 'black';
    this.blueBackground = theme.blueBackground;
    this.error = theme.error;
    this.warning = theme.warning;
    this.grey = theme.grey;
  }
}

const darkTheme = new Theme({
  regularText: '#ffffffff',
  text: '#ffffffff',
  regularBlue: '#03A9F4',
  simpleBackgroundColor: '#ffffffff',
  backgroundColor: '#ffffffff',
  blueBackground: '#ffffffff',
  error: '#ffffffff',
  warning: '#ffffffff',
  grey: 'grey',
});

const lightTheme = new Theme({
  regularText: '#ffffffff',
  text: '#ffffffff',
  regularBlue: '#03A9F4',
  simpleBackgroundColor: '#ffffffff',
  backgroundColor: '#ffffffff',
  blueBackground: '#ffffffff',
  error: '#900',
  warning: '#ffffffff',
  grey: 'grey',
});

export const useTheme = (): Theme => {
  const theme = useColorScheme();
  return theme === 'dark' ? darkTheme : lightTheme;
};
