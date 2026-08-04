import { baseApi } from '../baseApi';

export type ContentSlug = 'about' | 'terms' | 'privacy';

export interface ContentPage {
  slug: ContentSlug;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface IntroductionContent {
  message_title: string;
  message_quote: string;
  video_url: string;
  thumbnail_url?: string | null;
  video_file_name?: string | null;
  video_file_size?: number | null;
  thumbnail_file_name?: string | null;
  thumbnail_file_size?: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FAQListResponse {
  items: FAQItem[];
  total: number;
}

export interface SupportMessageRequest {
  category: string;
  subject: string;
  message: string;
}

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContentPage: builder.query<ContentPage, ContentSlug>({
      query: (slug) => `/content/${slug}`,
    }),
    getIntroductionContent: builder.query<IntroductionContent, void>({
      query: () => '/content/introduction',
    }),
    getFaqs: builder.query<FAQListResponse, void>({
      query: () => '/faqs',
    }),
    submitSupportMessage: builder.mutation<void, SupportMessageRequest>({
      query: (body) => ({
        url: '/support/messages',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetContentPageQuery,
  useGetIntroductionContentQuery,
  useGetFaqsQuery,
  useSubmitSupportMessageMutation,
} = contentApi;
