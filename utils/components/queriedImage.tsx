import React from 'react';
import {StyleProp} from 'react-native';
// import {StyleSheet, View} from 'react-native';
import FastImage, {ImageStyle} from 'react-native-fast-image';
import {ImageType} from '../store';

const DEFAULT_IMAGE = {
  uri: 'https://www.vigcenter.com/public/all/images/default-image.jpg',
};

interface QueriedImageProps {
  source?: ImageType;
  style?: StyleProp<ImageStyle> | undefined;
}

const QueriedImage = ({
  source = DEFAULT_IMAGE,
  style,
}: QueriedImageProps): JSX.Element => {
  const {uri} = source;

  return (
    <FastImage
      style={style}
      source={{
        uri: uri ?? DEFAULT_IMAGE.uri,
        priority: FastImage.priority.normal,
      }}
    />
  );
};

export default QueriedImage;
