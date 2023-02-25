import React, {memo, useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';
import QueriedImage from '../../utils/components/queriedImage';
import {
  DocRef,
  useCurrentUser,
  WorldHeader,
  WorldPreview,
} from '../../utils/store';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from 'react-query';
import firestore from '@react-native-firebase/firestore';
import {useTranslate} from '../../languages/translations';

interface WorldsCollapsibleProps {
  userRef: DocRef;
  worldsPreview: WorldPreview[];
}

const HEADER_RADIUS = 10;

const getWorlds = async (worldsPreview: WorldPreview[]) => {
  let worldsHeaders = worldsPreview
    ? new Array<WorldHeader>(worldsPreview.length)
    : [];

  const promises = [];
  for (let i = 0; i < worldsPreview.length; ++i) {
    promises.push(worldsPreview[i].smallData.get());
  }
  const responses = await Promise.all(promises);

  responses.forEach((worldDoc, i) => {
    const data = worldDoc.data();
    worldsHeaders[i] = {
      name: data?.name,
      ref: worldDoc.ref,
      refData: worldsPreview[i].bigData,
      image: data?.image,
    };
  });

  return worldsHeaders;
};

function WorldsCollapsible({userRef, worldsPreview}: WorldsCollapsibleProps) {
  const [open, setOpen] = useState<boolean>(false);
  const {t} = useTranslate();
  const currentUserWorlds = useCurrentUser(state => state.user?.worlds);
  const launchWorld = useCurrentUser(state => state.setSelectedWorldHeader);
  const curUserRef = useCurrentUser(state => state.user?.ref);

  const {data: worlds, isFetching} = useQuery<WorldHeader[], Error>(
    ['WORLDS_FOR', userRef.id],
    async () => {
      const response = await getWorlds(worldsPreview);
      return response;
    },
  );

  const dynamicHeaderStyle = {
    borderBottomStartRadius: open ? 0 : HEADER_RADIUS,
    borderBottomEndRadius: open ? 0 : HEADER_RADIUS,
  };

  const joinWorld = async (worldHeader: WorldHeader) => {
    try {
      if (curUserRef !== undefined) {
        await curUserRef.update({
          worlds: firestore.FieldValue.arrayUnion({
            smallData: worldHeader.ref,
            bigData: worldHeader.refData,
          }),
        });
        await worldHeader.refData.update({
          pendingUsers: firestore.FieldValue.arrayUnion({
            docRef: curUserRef,
            score: 0,
          }),
        });
      }
    } catch (error) {
      console.error(error as Error);
    }
  };

  if (isFetching) {
    return (
      <View style={styles.container}>
        <Text style={[styles.header, styles.textNoData]}>
          {t('LOADING_WORLDS_FOR_USER')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {worlds !== undefined && worlds.length > 0 ? (
        <Animated.View>
          <TouchableOpacity
            style={[styles.header, dynamicHeaderStyle]}
            onPress={() => setOpen(!open)}>
            <Text style={styles.title}>{t('WORLDS')}</Text>
            <MIcon
              name={open ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
          {open && (
            <View style={styles.bodyContainer}>
              {worlds.map((item, index) => {
                const connected = currentUserWorlds?.find(
                  w => w.ref.id === item.ref.id,
                );
                return (
                  <View key={item.ref.id}>
                    <View style={worldStyle.container}>
                      <QueriedImage
                        source={item.image}
                        style={worldStyle.image}
                      />
                      <Text style={worldStyle.title}>{item.name}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          connected ? launchWorld(item) : joinWorld(item);
                          setOpen(false);
                        }}
                        style={{}}>
                        <Text>{t(connected ? 'LAUNCH' : 'JOIN')}</Text>
                      </TouchableOpacity>
                    </View>
                    {worlds.length - 1 > index && (
                      <View style={worldStyle.separator} />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>
      ) : (
        <Text style={styles.textNoData}>{t('NO_WORLDS_FOUND')}</Text>
      )}
    </View>
  );
}

export default memo(WorldsCollapsible);

const styles = StyleSheet.create({
  container: {
    borderColor: 'grey',
    borderRadius: HEADER_RADIUS,
    borderWidth: 1,
    marginTop: 10,
    marginHorizontal: 10,
  },
  header: {
    flex: 1,
    padding: 12,
    backgroundColor: '#dddd',
    flexDirection: 'row',
    borderTopStartRadius: HEADER_RADIUS,
    borderTopEndRadius: HEADER_RADIUS,
    alignItems: 'center',
  },
  title: {flex: 1},
  bodyContainer: {padding: 5},
  textNoData: {padding: 10},
});

const worldStyle = StyleSheet.create({
  container: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {flex: 1},
  image: {
    height: 30,
    borderRadius: 30,
    aspectRatio: 1,
    marginEnd: 10,
  },
  separator: {
    height: 1,
    flex: 1,
    backgroundColor: 'grey',
    margin: 3,
  },
});
