import type { VideoSource } from 'expo-video';

export const FAST_START_BUFFER_OPTIONS = {
  preferredForwardBufferDuration: 10,
  waitsToMinimizeStalling: true,
  minBufferForPlayback: 1.5,
  prioritizeTimeOverSizeThreshold: true,
} as const;

export const createVideoSource = (uri: string): VideoSource => {
  const path = uri.split('?')[0].toLowerCase();
  const isRemote = uri.startsWith('http://') || uri.startsWith('https://');
  const isHls = path.endsWith('.m3u8');

  return {
    uri,
    contentType: isHls ? 'hls' : 'progressive',
    useCaching: isRemote && !isHls,
  };
};
