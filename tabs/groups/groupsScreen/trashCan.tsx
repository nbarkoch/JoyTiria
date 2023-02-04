import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {LayoutProps} from '../types';

export interface TrashCanRef {
  isIn: (layoutProps: LayoutProps) => boolean;
  measure: () => void;
}

interface TrashCanProps {}

const TrashCan = forwardRef<TrashCanRef, TrashCanProps>(({}, ref) => {
  const viewRef = useRef<View>(null);
  const [layoutProps, setLayoutProps] = useState<LayoutProps | undefined>(
    undefined,
  );

  const measure = useCallback(() => {
    const timeout = setTimeout(() => {
      viewRef.current?.measureInWindow((x, y, width, height) => {
        setLayoutProps({x, y, width, height});
        clearTimeout(timeout);
      });
    }, 300);
  }, []);

  useImperativeHandle(ref, () => ({
    isIn: ({x, y, width, height}) => {
      if (layoutProps) {
        const isInXAxis =
          layoutProps.x < x + width / 3 &&
          x + width / 3 < layoutProps.x + layoutProps.width;
        const isInYAxis =
          layoutProps.y < y + height / 3 &&
          y + height / 3 < layoutProps.y + layoutProps.height;
        return isInXAxis && isInYAxis;
      }

      return false;
    },
    measure: measure,
  }));
  return (
    <View ref={viewRef} onLayout={measure} style={styles.trashIconView}>
      <Icon name={'trash'} size={35} color="#555555" style={styles.icon} />
    </View>
  );
});

const styles = StyleSheet.create({
  trashIconView: {
    backgroundColor: '#f88f',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
    padding: 10,
    alignSelf: 'baseline',
    height: 55,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  icon: {},
});

export default TrashCan;
