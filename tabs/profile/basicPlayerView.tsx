import React, {Image, StyleSheet, Text} from 'react-native';
import {useQuery} from 'react-query';
import {Player, User} from '../../utils/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

const DEFAULT_IMAGE = {
  uri: 'https://www.vigcenter.com/public/all/images/default-image.jpg',
};

const BasicPlayerView = ({
  docRef,
  isUser,
  score,
  highlight,
}: Player & {isUser: boolean; highlight: boolean}): JSX.Element => {
  const {data: user} = useQuery<User | undefined, Error>(
    ['USER', {id: docRef.id}],
    async () => {
      const response = await docRef.get();
      return response.data() as User | undefined;
    },
  );

  const animatedValue = useDerivedValue(
    () => withTiming(highlight ? 1 : 0),
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
    <Animated.View style={[playerStyle.container, animatedStyle]}>
      <Image
        style={playerStyle.image}
        source={user.image !== undefined ? user.image : DEFAULT_IMAGE}
      />
      <Text style={playerStyle.name}>
        <Text>{user.name}</Text>
        {isUser && <Text>{' (You)'}</Text>}
      </Text>

      <Text style={playerStyle.score}>{score}</Text>
      <Icon name={'star'} size={25} style={playerStyle.icon} color="#FFDE52" />
    </Animated.View>
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
  name: {paddingHorizontal: 10, flex: 1, color: 'black'},
  score: {paddingHorizontal: 3, color: 'black'},
  icon: {},
});
