import React, {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useQuery} from 'react-query';
import {Player, User} from '../../utils/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import QueriedImage from '../../utils/components/queriedImage';
import {useTranslate} from '../../languages/translations';

const BasicPlayerView = ({
  docRef,
  isUser,
  score,
  highlight,
  onPress,
}: Player & {
  isUser: boolean;
  highlight: boolean;
  onPress: () => void;
}): JSX.Element => {
  const {t} = useTranslate();
  const {data: user} = useQuery<User | undefined, Error>(
    ['USER', {id: docRef.id}],
    async () => {
      const response = await docRef.get();
      return response.data() as User | undefined;
    },
  );

  const animatedValue = useDerivedValue(
    () => withTiming(highlight ? 1 : 0, {duration: 270}),
    [highlight],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      ['white', '#afe8ff'],
    );
    return {backgroundColor};
  });

  if (user === undefined) {
    return <></>;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View style={[playerStyle.container, animatedStyle]}>
        <QueriedImage style={playerStyle.image} source={user.image} />
        <Text style={playerStyle.name}>
          <Text>{user.name}</Text>
          {isUser && <Text>{` (${t('YOU')})`}</Text>}
        </Text>
        <Text style={playerStyle.score}>{score}</Text>
        <Icon
          name={'star'}
          size={25}
          style={playerStyle.icon}
          color="#FFDE52"
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BasicPlayerView;

const playerStyle = StyleSheet.create({
  image: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  container: {
    backgroundColor: 'white',
    margin: 3,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    paddingHorizontal: 10,
    flex: 1,
    color: 'black',
    textAlign: 'left',
  },
  score: {paddingHorizontal: 3, color: 'black'},
  icon: {},
});
