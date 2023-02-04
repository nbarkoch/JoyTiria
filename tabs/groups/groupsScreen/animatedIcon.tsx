import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import {
  Transition,
  TransitioningView,
  Transitioning,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TRANSITION_DURATION = 200;

const transition = (
  <Transition.Together>
    <Transition.In type="fade" durationMs={TRANSITION_DURATION} />
    <Transition.Change />
    <Transition.Out type="fade" durationMs={TRANSITION_DURATION} />
  </Transition.Together>
);

function AnimatedIcon({
  icon,
  placeHolder,
  onFocus,
  onSubmit,
  keyboardOpened = false,
}: {
  icon: string;
  placeHolder?: string;
  onFocus: (offset: number) => void;
  keyboardOpened: boolean;
  onSubmit: (value: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const ref = useRef<TransitioningView>(null);
  const offset = useRef<number | undefined>(undefined);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        textInputRef.current?.focus();
        clearTimeout(timeout);
      }, TRANSITION_DURATION);
    } else {
      textInputRef.current?.blur();
    }
  }, [open]);

  return (
    <Transitioning.View
      ref={ref}
      transition={transition}
      style={[
        styles.addNewIcon,
        {
          ...(open
            ? {flex: 1, marginHorizontal: 5}
            : {
                alignSelf: 'baseline',
                width: 55,
                height: 55,
                marginHorizontal: 10,
              }),
        },
      ]}
      onLayout={event => {
        if (offset.current === undefined) {
          offset.current = event.nativeEvent.layout.y;
        }
      }}>
      <TouchableOpacity
        disabled={open}
        style={styles.expandedView}
        onPress={() => {
          ref.current?.animateNextTransition();
          setOpen(true);
        }}>
        <Icon name={icon} size={35} color="#555555" style={styles.icon} />
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholderTextColor={'#AAAA'}
          onFocus={() => {
            if (!keyboardOpened) {
              onFocus(offset.current ?? 0);
            }
          }}
          textContentType={'emailAddress'}
          placeholder={placeHolder}
          value={value}
          onChangeText={setValue}
        />
        {open && (
          <>
            <TouchableOpacity
              onPress={async () => {
                const shouldClose =
                  value.length === 0 || (await onSubmit(value));
                if (shouldClose) {
                  setValue('');
                  ref.current?.animateNextTransition();
                  setOpen(false);
                }
              }}>
              <Icon
                name={value.length === 0 ? 'close' : 'add-circle-outline'}
                size={35}
                color="#555555"
                style={styles.icon}
              />
            </TouchableOpacity>
          </>
        )}
      </TouchableOpacity>
    </Transitioning.View>
  );
}

const styles = StyleSheet.create({
  addNewIcon: {
    backgroundColor: 'white',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
    margin: 5,
    padding: 10,
    height: 55,
  },

  expandedView: {flexDirection: 'row', alignItems: 'center'},
  textInput: {
    fontSize: 20,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 0,
    color: 'black',
  },

  icon: {},
});

export default AnimatedIcon;
