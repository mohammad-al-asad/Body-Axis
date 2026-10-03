import { baseApi } from '../baseApi';

export interface PlatformVersionConfig {
  latest_version: string;
  minimum_version: string;
  force_update: boolean;
  title: string;
  message: string;
  url: string;
}

export interface AppVersionConfig {
  ios: PlatformVersionConfig;
  android: PlatformVersionConfig;
}

export const appConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppVersionConfig: builder.query<AppVersionConfig, void>({
      query: () => '/app/version-config',
    }),
  }),
});

export const { useGetAppVersionConfigQuery } = appConfigApi;
