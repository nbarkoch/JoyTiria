import React from 'react';
import {View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {useQuery, QueryClient} from 'react-query';
import {ImageType} from '../store';

const DEFAULT_IMAGE = {
  uri: 'https://www.vigcenter.com/public/all/images/default-image.jpg',
};

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

interface QueriedImageProps {
  source?: ImageType;
  style: any;
}

const QueriedImage = ({
  source = DEFAULT_IMAGE,
  style,
}: QueriedImageProps): JSX.Element => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
      },
    },
  });

  const {uri} = source;

  const {data, isLoading} = useQuery<Blob, Error>(uri, async () => {
    const response = await fetch(uri);
    const imageData = await response.blob();
    queryClient.setQueryData([uri, 'data'], imageData);
    return imageData;
  });

  if (isLoading || source === undefined) {
    return <View style={style} />;
  }

  return (
    <Animated.Image
      entering={FadeIn}
      style={style}
      source={data ? {uri: URL.createObjectURL(data)} : DEFAULT_IMAGE}
    />
  );
};

export default QueriedImage;
