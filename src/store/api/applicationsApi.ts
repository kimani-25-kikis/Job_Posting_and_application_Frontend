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
    applyForJob: builder.mutation<{ success: boolean; message: string; data: Application }, number>({
      query: (jobId) => ({
        url: '/applications/apply',
        method: 'POST',
        body: { jobId },
      }),
      invalidatesTags: ['Applications'],
    }),
    getEmployeeApplications: builder.query<ApplicationsResponse, void>({
      query: () => '/employee/applications',
      providesTags: ['Applications'],
    }),
    getEmployerApplications: builder.query<ApplicationResponse, void>({
      query: () => '/employer/applications',
      providesTags: ['Applications'],
    }),
    updateApplicationStatus: builder.mutation<
      { success: boolean; message: string }, 
      { applicationId: number; status: Application['status'] }
    >({
      query: ({ applicationId, status }) => ({
        url: `/applications/${applicationId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Applications'],
    }),
  }),
});

export const {
  useApplyForJobMutation,
  useGetEmployeeApplicationsQuery,
  useGetEmployerApplicationsQuery,
  useUpdateApplicationStatusMutation,
} = applicationsApi;