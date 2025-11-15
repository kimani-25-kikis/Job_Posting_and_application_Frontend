import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { type RootState } from '../store';

export interface Application {
  id: number;
  job_id: number;
  employee_id: number;
  status: 'applied' | 'viewed' | 'shortlisted' | 'rejected' | 'accepted';
  applied_at: string;
  updated_at: string;
  job_title?: string;
  employer_name?: string;
  employee_name?: string;
  resume_filename?: string;
  resume_url?: string;
  file_size?: number;
}

interface ApplicationStats {
  total: number;
  applied: number;
  viewed: number;
  shortlisted: number;
  rejected: number;
  accepted: number;
}

interface ApplicationsResponse {
  success: boolean;
  data: {
    applications: Application[];
    stats: ApplicationStats;
  };
}

interface ApplicationResponse {
  success: boolean;
  data: Application[];
}

export const applicationsApi = createApi({
  reducerPath: 'applicationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Applications'],
  endpoints: (builder) => ({

    // Apply for job (can later pass resumeData)
    applyForJob: builder.mutation<
      { success: boolean; message: string; data: Application },
      { jobId: number; resumeData?: any }
    >({
      query: ({ jobId, resumeData }) => ({
        url: '/applications/apply',
        method: 'POST',
        body: resumeData ? { jobId, resumeData } : { jobId },
      }),
      invalidatesTags: ['Applications'],
    }),

    // Get logged-in employee's applications + stats
    getEmployeeApplications: builder.query<ApplicationsResponse, void>({
      query: () => '/employee/applications',
      providesTags: ['Applications'],
    }),

    // Get employer applications
    getEmployerApplications: builder.query<ApplicationResponse, void>({
      query: () => '/employer/applications',
      providesTags: ['Applications'],
    }),

    // Update application status (merged version)
    updateApplicationStatus: builder.mutation<
      { success: boolean; message: string },
      { applicationId: number; status: string }
    >({
      query: ({ applicationId, status }) => ({
        url: `/applications/${applicationId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Applications'],
    }),

    // Upload resume (NEW)
    uploadResume: builder.mutation<
      { success: boolean; data: { filename: string; originalName: string; url: string; size: number } },
      FormData
    >({
      query: (formData) => ({
        url: '/upload/resume',
        method: 'POST',
        body: formData,
      }),
    }),

  }),
});

export const {
  useApplyForJobMutation,
  useGetEmployeeApplicationsQuery,
  useGetEmployerApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useUploadResumeMutation, // <-- NEW HOOK
} = applicationsApi;
