import React, {ReactElement, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  I18nManager,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {isUndefined} from 'lodash';
import Animated, {FadeInUp} from 'react-native-reanimated';

interface Props<T> {
  defaultValue?: T;
  data: Array<T>;
  onSelect?: (item: T) => void;
}

const {width: windowWidth} = Dimensions.get('window');

const Separator = () => (
  <View style={styles.separatorContainer}>
    <View style={styles.separator} />
  </View>
);

function TextPicker<T extends {value: string}>({
  data = [],
  onSelect = () => {},
  defaultValue = undefined,
}: Props<T>): JSX.Element {
  const DropdownButton = useRef<TouchableOpacity>(null);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const [dropdownX, setDropdownX] = useState(0);

  const [selectedItem, setSelectedItem] = useState<T | undefined>(
    defaultValue ?? data[0],
  );

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isUndefined(selectedItem)) {
      onSelect(selectedItem);
    }
    setVisible(false);
  }, [onSelect, selectedItem, data]);

  const openDropDown = () => {
    DropdownButton.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setDropdownTop(py + h);
      setDropdownWidth(_w);
      setDropdownX(I18nManager.isRTL ? windowWidth - _px - _w : _px);
    });
    setVisible(true);
  };

  const onPress = (item: T, _: number) => {
    onSelect(item);
    setSelectedItem(item);
  };

  const renderDropdown = (): ReactElement<any, any> => {
    return (
      <Modal visible={visible} transparent animationType="none">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}>
          <Animated.View
            entering={FadeInUp}
            style={[
              styles.dropdown,
              {top: dropdownTop, width: dropdownWidth, left: dropdownX},
            ]}>
            <FlatList
              data={data}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  style={styles.item}
                  key={index}
                  onPress={() => onPress(item, index)}>
                  <Text style={styles.itemText}>{item.value}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={Separator}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <TouchableOpacity
      ref={DropdownButton}
      onPress={openDropDown}
      style={[
        styles.header,
        {
          ...(visible
            ? {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                backgroundColor: '#fff',
              }
            : {}),
        },
      ]}>
      <Text style={styles.selectedTextStyle}>{selectedItem?.value}</Text>
      {visible && renderDropdown()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
    shadowColor: '#000000',
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    shadowRadius: 4,
    elevation: 5,
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.3,
    left: 0,
  },
  overlay: {
    flex: 1,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: '#ddd',
  },
  itemText: {fontSize: 16, color: '#555555'},
  header: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
    color: '#555555',
    textAlign: 'left',
  },
  separator: {
    backgroundColor: '#EEEEEE',
    height: 0.8,
  },
  separatorContainer: {
    backgroundColor: '#fff',
    height: 1,
    paddingHorizontal: 5,
  },
});

export default TextPicker;
