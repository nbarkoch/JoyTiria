import {isUndefined} from 'lodash';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useQuery} from 'react-query';
import {Group, User} from '../../../utils/store';
import {LayoutProps} from '../types';

type GroupViewProps = Group & {
  onPress: () => void;
  onLongPress?: () => void;
};
export type GroupViewRef = {
  isIn: (layoutProps: LayoutProps) => boolean;
  measure: () => void;
};

const GroupView = forwardRef<GroupViewRef, GroupViewProps>(
  ({players, leader, name, onPress, onLongPress = () => {}}, ref) => {
    const [layoutProps, setLayoutProps] = useState<LayoutProps | undefined>(
      undefined,
    );
    const touchableRef = useRef<TouchableOpacity>(null);

    const {data: leaderUser} = useQuery<User | undefined, Error>(
      ['USER', {id: leader?.docRef.id}],
      async () => {
        const response = await leader?.docRef.get();
        return response?.data() as User | undefined;
      },
      {enabled: !isUndefined(leader?.docRef.id)},
    );

    const measure = useCallback(() => {
      const timeout = setTimeout(() => {
        touchableRef.current?.measureInWindow((x, y, width, height) => {
          setLayoutProps({x, y, width, height});
          clearTimeout(timeout);
        });
      }, 300);
    }, []);

    useImperativeHandle(ref, () => ({
      isIn: ({x, y, width, height}) => {
        if (layoutProps) {
          const isInXAxis =
            layoutProps.x < x + width / 2 &&
            x + width / 2 < layoutProps.x + layoutProps.width;
          const isInYAxis =
            layoutProps.y < y + height / 2 &&
            y + height / 2 < layoutProps.y + layoutProps.height;

          return isInXAxis && isInYAxis;
        }
        return false;
      },
      measure: measure,
    }));

    return (
      <TouchableOpacity
        ref={touchableRef}
        style={styles.group}
        onPress={onPress}
        onLongPress={onLongPress}
        onLayout={measure}>
        <Text numberOfLines={1} style={styles.groupName}>
          {name}
        </Text>
        <Icon name="group" size={45} color="#555555" style={styles.icon} />
        <Text style={styles.numPlayers}>
          {(players?.length.toString() ?? '0') + ' Players'}
        </Text>
        <Text style={styles.groupLeader}>
          {'Leader: ' + (!isUndefined(leader) ? leaderUser?.name : 'None')}
        </Text>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  group: {
    height: 140,
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#adf',
    borderWidth: 1,
    margin: 10,
    shadowColor: '#adf',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  groupName: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    color: 'black',
  },
  numPlayers: {color: 'black'},
  groupLeader: {color: 'black'},
  icon: {},
});

export default GroupView;