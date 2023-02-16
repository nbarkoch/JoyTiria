import React from 'react';
import {StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ImageType} from '../store';

const DEFAULT_IMAGE = {
  uri: 'https://www.vigcenter.com/public/all/images/default-image.jpg',
};

interface QueriedImageProps {
  source?: ImageType;
  style: any;
}

const QueriedImage = ({
  source = DEFAULT_IMAGE,
  style,
}: QueriedImageProps): JSX.Element => {
  const {uri} = source;

  if (uri === undefined) {
    return <View style={styles.loadingStyle} />;
  }

  return (
    <FastImage
      style={style}
      source={{uri, priority: FastImage.priority.normal}}
    />
  );
};

const styles = StyleSheet.create({
  loadingStyle: {backgroundColor: '#dddddd'},
});

export default QueriedImage;
