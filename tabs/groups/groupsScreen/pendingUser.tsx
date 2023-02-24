import React, {useState, useRef, useEffect} from 'react';
import {Text, StyleSheet} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import {useQuery} from 'react-query';
import QueriedImage from '../../../utils/components/queriedImage';
import {Group, Player, User} from '../../../utils/store';
import {LayoutProps} from '../types';

const PendingUser = ({
  player,
  findIfInAnyGroup,
  addUserToGroup,
  findIfInTrashCan,
  onDragStart,
  onDragEnd,
  deletePendingUser,
}: {
  player: Player;
  findIfInAnyGroup: (layoutProps: LayoutProps) => Group | undefined;
  addUserToGroup: (player: Player, group: Group) => void;
  findIfInTrashCan: (layoutProps: LayoutProps) => boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  deletePendingUser: (player: Player) => Promise<boolean>;
}) => {
  const [shortName, setShortName] = useState<string | undefined>(undefined);

  const [panned, setPanned] = useState<boolean>(false);

  const {data: user} = useQuery<User | undefined, Error>(
    ['USER', {id: player.docRef.id}],
    async () => {
      const response = await player.docRef.get();
      return response.data() as User | undefined;
    },
  );

  useEffect(() => {
    if (!panned) {
      measure();
    }
  }, [panned]);

  useEffect(() => {
    if (user !== undefined) {
      const $shortName = (user.name as string).split(' ', 1)[0];
      const shortNameSingleLine =
        $shortName.length > 15
          ? $shortName.substring(0, 12) + '...'
          : $shortName;
      setShortName(shortNameSingleLine);
    }
  }, [user]);

  const onPickUp = () => {
    onDragStart();
    setPanned(true);
  };

  const onLetGo = (layoutProps: LayoutProps) => {
    const group = findIfInAnyGroup(layoutProps);
    if (group === undefined) {
      if (findIfInTrashCan(layoutProps)) {
        scale.value = withTiming(0, {duration: 400});
        const timeout = setTimeout(async () => {
          const deleted = await deletePendingUser(player);
          if (!deleted) {
            scale.value = withTiming(1, {duration: 100});
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
          }
          onDragEnd();
          clearTimeout(timeout);
        }, 600);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        onDragEnd();
      }
    } else {
      scale.value = withTiming(0, {duration: 400});
      const timeout = setTimeout(() => {
        addUserToGroup(player, group);
        onDragEnd();
        clearTimeout(timeout);
      }, 600);
    }
    setPanned(false);
  };

  const measure = () => {
    const timeout = setTimeout(() => {
      ref.current?.measureInWindow((x, y, width, height) => {
        originalLayoutProps.current = {
          x,
          y,
          width,
          height,
        };
      });
      clearTimeout(timeout);
    }, 300);
  };

  const ref = useRef<Animated.View>(null);
  const originalLayoutProps = useRef<LayoutProps>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  });
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: panned ? 'absolute' : 'relative',
      transform: [
        {translateX: translateX.value},
        {translateY: translateY.value},
        {scale: panned ? scale.value * 1.1 : scale.value},
      ],
      zIndex: panned ? 1000 : 0,
    };
  });
  const gesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onPickUp)();
    })
    .onUpdate(event => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      // console.log(
      //   event.translationX,
      //   event.translationY,
      //   originalLayoutProps.current.x,
      //   originalLayoutProps.current.y,
      // );
    })
    .onEnd(event => {
      runOnJS(onLetGo)({
        x: event.translationX + originalLayoutProps.current.x,
        y: event.translationY + originalLayoutProps.current.y,
        width: originalLayoutProps.current.width,
        height: originalLayoutProps.current.height,
      });
    });

  if (user === undefined) {
    return <></>;
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        ref={ref}
        // onLayout={measure}
        style={[styles.PendingUser, animatedStyle]}>
        <Text style={[styles.PendingUserName]} numberOfLines={1}>
          {user !== undefined ? shortName : ''}
        </Text>

        {/* <Text>{userRef.id}</Text> */}
        <QueriedImage style={styles.PendingUserImage} source={user.image} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  PendingUser: {
    alignSelf: 'baseline',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 22,
    backgroundColor: '#fff',
    marginBottom: 7,
    marginHorizontal: 3,
  },
  PendingUserName: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    paddingStart: 5,
    paddingEnd: 16,
    maxWidth: 130,
    height: 20,
    textAlign: 'center',
  },
  PendingUserImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
});

export default PendingUser;
