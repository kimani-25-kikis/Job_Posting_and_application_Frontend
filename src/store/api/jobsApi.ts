import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { type RootState } from '../store';

export interface Job {
  id: number;
  employer_id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  created_at: string;
  is_active: boolean;
  employer_name?: string;
}

interface CreateJobData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
}

interface JobsResponse {
  success: boolean;
  data: Job[];
}

interface JobResponse {
  success: boolean;
  data: Job;
}

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
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
  tagTypes: ['Jobs'],
  endpoints: (builder) => ({
    getAllJobs: builder.query<JobsResponse, void>({
      query: () => '/jobs',
      providesTags: ['Jobs'],
    }),
    getJob: builder.query<JobResponse, number>({
      query: (id) => `/jobs/${id}`,
    }),
    createJob: builder.mutation<JobResponse, CreateJobData>({
      query: (jobData) => ({
        url: '/jobs',
        method: 'POST',
        body: jobData,
      }),
      invalidatesTags: ['Jobs'],
    }),
    getEmployerJobs: builder.query<JobsResponse, void>({
      query: () => '/employer/jobs',
      providesTags: ['Jobs'],
    }),
  }),
});

export const { 
  useGetAllJobsQuery, 
  useGetJobQuery, 
  useCreateJobMutation, 
  useGetEmployerJobsQuery 
} = jobsApi;