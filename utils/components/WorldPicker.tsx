import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useCurrentUser, WorldHeader} from '../store';
import QueriedImage from './queriedImage';

interface Props {
  label?: string;
  data: Array<WorldHeader>;
  onSelect?: (item: WorldHeader) => void;
  onCreateNewWorld?: (name: string) => Promise<boolean>;
  onDeleteWorld?: (item: WorldHeader) => Promise<boolean>;
}

const Separator = () => (
  <View style={styles.separatorContainer}>
    <View style={styles.separator} />
  </View>
);

interface AddNewWorldProps {
  onSubmit: (value: string) => Promise<boolean>;
  style?: StyleProp<ViewStyle>;
}

const AddNewWorldRow = ({onSubmit, style = {}}: AddNewWorldProps) => {
  const [newWorldState, setNewWorldState] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');

  if (newWorldState) {
    return (
      <View style={style}>
        <Icon
          name="close"
          size={25}
          color="#555555"
          style={styles.cancelIcon}
          onPress={() => {
            setNewWorldState(false);
          }}
        />
        <View style={styles.TextInputContainer}>
          <TextInput
            autoFocus={true}
            placeholder="Type name of world"
            placeholderTextColor={'#AAAA'}
            value={value}
            onChangeText={setValue}
            style={[
              styles.TextInput,
              style ? {backgroundColor: (style as ViewStyle).borderColor} : {},
            ]}
          />
        </View>
        <TouchableOpacity
          onPress={async () => {
            const success = await !onSubmit(value);
            setNewWorldState(success);
            if (success) {
              setValue('');
            }
          }}>
          <Icon
            name="add-circle-outline"
            size={30}
            color="#555555"
            style={styles.addNewIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={style}
      onPress={() => {
        setNewWorldState(true);
      }}>
      <Text style={styles.selectedTextStyle}>{'Add new'}</Text>
      <Icon
        name="add-circle-outline"
        size={30}
        color="#555555"
        style={styles.addNewIcon}
      />
    </TouchableOpacity>
  );
};

interface WorldItemProps {
  item: WorldHeader;
  onItemPress: (item: WorldHeader) => void;
  onSubmitItem: (item: WorldHeader) => void;
}

const WorldItem: FC<WorldItemProps> = ({
  item,
  onItemPress,
  onSubmitItem,
}): ReactElement<any, any> => {
  const [selected, setSelected] = useState<boolean>(false);

  if (selected) {
    return (
      <View style={styles.itemSelected}>
        <Icon
          name="close"
          size={25}
          color="#555555"
          style={styles.cancelIcon}
          onPress={() => {
            setSelected(false);
          }}
        />
        <Text style={styles.selectedTextStyle}>{item.name}</Text>
        <TouchableOpacity
          onPress={async () => {
            onSubmitItem(item);
          }}>
          <Icon
            name="trash"
            size={28}
            color="#555555"
            style={styles.deleteIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onItemPress(item)}
      onLongPress={() => setSelected(true)}>
      <Text style={styles.selectedTextStyle}>{item.name}</Text>
      <QueriedImage style={styles.imageStyle} source={item.image} />
    </TouchableOpacity>
  );
};

function WorldPicker({
  data = [],
  onSelect = () => {},
  onCreateNewWorld = () => Promise.resolve(false),
  onDeleteWorld = () => Promise.resolve(false),
}: Props): JSX.Element {
  const DropdownButton = useRef<TouchableOpacity>(null);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const [dropdownX, setDropdownX] = useState(0);

  const selectedItem =
    useCurrentUser(state => state.selectedWorldHeader) ?? data[0];
  const setSelectedItem = useCurrentUser(state => state.setSelectedWorldHeader);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    onSelect(selectedItem);
    setVisible(false);
  }, [onSelect, selectedItem, data]);

  const onDeleteSelectedWorld = useCallback(
    async (world: WorldHeader) => {
      const success = await onDeleteWorld(world);
      if (success && world === selectedItem) {
        setSelectedItem(data[0]);
      }
    },
    [data, selectedItem, onDeleteWorld, setSelectedItem],
  );

  const renderItem = ({item}: {item: WorldHeader}): ReactElement<any, any> => {
    return (
      <WorldItem
        item={item}
        onItemPress={setSelectedItem}
        onSubmitItem={onDeleteSelectedWorld}
      />
    );
  };

  const openDropDown = () => {
    DropdownButton.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setDropdownTop(py + h);
      setDropdownWidth(_w);
      setDropdownX(_px);
    });
    setVisible(true);
  };

  const Footer = () => (
    <>
      <Separator />
      <AddNewWorldRow onSubmit={onCreateNewWorld} style={styles.item} />
    </>
  );

  const renderDropdown = (): ReactElement<any, any> => {
    return (
      <Modal visible={visible} transparent animationType="none">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}>
          <View
            style={[
              styles.dropdown,
              {top: dropdownTop, width: dropdownWidth, left: dropdownX},
            ]}>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => item.name + index.toString()}
              ItemSeparatorComponent={Separator}
              ListFooterComponent={Footer}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  if (selectedItem === undefined) {
    return <AddNewWorldRow onSubmit={onCreateNewWorld} style={styles.header} />;
  }

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
      <Text style={styles.selectedTextStyle}>{selectedItem.name}</Text>
      <QueriedImage style={styles.imageStyle} source={selectedItem.image} />
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
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.5,
    left: 0,
  },
  overlay: {
    flex: 1,
  },
  item: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: '#ddd',
  },
  itemText: {fontSize: 14, color: '#555555'},
  itemSelected: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: '#ddd',
    backgroundColor: '#f99f',
  },
  header: {
    alignSelf: 'stretch',
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 22,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: 'white',
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
    color: '#555555',
  },
  TextInputContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  TextInput: {
    fontSize: 16,
    color: 'black',
    flexWrap: 'wrap',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  imageStyle: {
    width: 30,
    height: 30,
    borderRadius: 18,
    padding: 10,
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
  addNewIcon: {},
  cancelIcon: {},
  deleteIcon: {paddingEnd: 2},
});

export default WorldPicker;
