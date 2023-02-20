import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';
import QueriedImage from '../../utils/components/queriedImage';
import {WorldHeader, WorldPreview} from '../../utils/store';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from 'react-query';

interface WorldsCollapsibleProps {
  id: string;
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

function WorldsCollapsible({id, worldsPreview}: WorldsCollapsibleProps) {
  const [open, setOpen] = useState<boolean>(false);

  const {data: worlds} = useQuery<WorldHeader[], Error>(
    ['WORLDS_FOR', {id}],
    async () => {
      const response = await getWorlds(worldsPreview);
      return response;
    },
  );

  const dynamicHeaderStyle = {
    borderBottomStartRadius: open ? 0 : HEADER_RADIUS,
    borderBottomEndRadius: open ? 0 : HEADER_RADIUS,
  };

  return (
    <View style={styles.container}>
      {worlds !== undefined && worlds.length > 0 ? (
        <Animated.View>
          <TouchableOpacity
            style={[styles.header, dynamicHeaderStyle]}
            onPress={() => setOpen(!open)}>
            <Text style={styles.title}>{'Worlds'}</Text>
            <MIcon
              name={open ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
          {open && (
            <View style={styles.bodyContainer}>
              {worlds.map((item, index) => {
                console.log(item);
                return (
                  <View key={item.ref.id}>
                    <View style={worldStyle.container}>
                      <QueriedImage
                        source={item.image}
                        style={worldStyle.image}
                      />
                      <Text style={worldStyle.title}>{item.name}</Text>
                      <TouchableOpacity style={{}}>
                        <Text>{'Join'}</Text>
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
        <Text style={styles.textNoData}>
          {"This user doesn't connected to any world"}
        </Text>
      )}
    </View>
  );
}

export default WorldsCollapsible;

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
