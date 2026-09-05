import type { VideoSource } from 'expo-video';

export const FAST_START_BUFFER_OPTIONS = {
  preferredForwardBufferDuration: 10,
  waitsToMinimizeStalling: true,
  minBufferForPlayback: 1.5,
  prioritizeTimeOverSizeThreshold: true,
} as const;

export interface CreateVideoSourceOptions {
  useCaching?: boolean;
}

export const createVideoSource = (
  uri: string,
  options?: CreateVideoSourceOptions
): VideoSource => {
  const path = uri.split('?')[0].toLowerCase();
  const isHls = path.endsWith('.m3u8');

  return {
    uri,
    contentType: isHls ? 'hls' : 'progressive',
    // Default caching to false: expo-video's iOS caching rewrites URLs to a custom
    // "expo-video-cache://" scheme with an AVAssetResourceLoaderDelegate, which breaks
    // AirPlay streaming to external receivers (Mac / Apple TV).
    useCaching: options?.useCaching ?? false,
  };
};
