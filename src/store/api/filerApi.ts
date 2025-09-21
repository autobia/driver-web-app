import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface UploadFileRequest {
  content_type: number;
  object_id: number;
  type: number;
  base64_file: string;
}

interface UploadFileResponse {
  success: boolean;
}

export const filerApi = createApi({
  reducerPath: "filerApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["files"],
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadFileResponse, UploadFileRequest>({
      query: (data) => ({
        url: `/filer/`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["files"],
    }),
  }),
});

export const { useUploadFileMutation } = filerApi;

export default filerApi.reducer;
