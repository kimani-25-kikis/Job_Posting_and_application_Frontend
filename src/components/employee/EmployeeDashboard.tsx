import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetAllJobsQuery } from '../../store/api/jobsApi';
import { useGetEmployeeApplicationsQuery, useApplyForJobMutation } from '../../store/api/applicationsApi';
import { selectCurrentUser } from '../../store/slices/authSlice';
import {type RootState } from '../../store/store';
import { type Job } from '../../store/api/jobsApi';
import { type Application } from '../../store/api/applicationsApi';

const EmployeeDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  
  const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } = useGetAllJobsQuery();
  const { data: applicationsData, isLoading: applicationsLoading, refetch: refetchApplications } = useGetEmployeeApplicationsQuery();
  const [applyForJob, { isLoading: applying }] = useApplyForJobMutation();

  const handleApply = async (jobId: number) => {
    try {
      await applyForJob(jobId).unwrap();
      refetchApplications();
      refetchJobs();
    } catch (error) {
      console.error('Failed to apply for job:', error);
    }
  };

  const jobs = jobsData?.data || [];
  const applications = applicationsData?.data?.applications || [];
  const stats = applicationsData?.data?.stats || {
    total: 0,
    applied: 0,
    viewed: 0,
    shortlisted: 0,
    rejected: 0,
    accepted: 0
  };

  const hasAppliedToJob = (jobId: number) => {
    return applications.some((app: Application) => app.job_id === jobId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Seeker Dashboard</h1>
          <p className="mt-2 text-gray-600">Find your next opportunity and track your applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applied</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Viewed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.viewed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.shortlisted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.accepted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'jobs'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Browse Jobs
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'applications'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Applications
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'jobs' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Jobs</h2>

                {jobsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading jobs...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs available</h3>
                    <p className="mt-1 text-sm text-gray-500">Check back later for new job postings.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {jobs.map((job: Job) => {
                      const hasApplied = hasAppliedToJob(job.id);
                      
                      return (
                        <div key={job.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                              <p className="text-gray-600 mt-1">
                                {job.employer_name} • {job.location} • {job.salary}
                              </p>
                              <p className="text-gray-500 text-sm mt-2 line-clamp-2">{job.description}</p>
                              
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700">Requirements:</h4>
                                <p className="text-gray-600 text-sm mt-1">{job.requirements}</p>
                              </div>
                            </div>
                            
                            <div className="ml-6 flex flex-col items-end space-y-2">
                              {hasApplied ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  Applied
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleApply(job.id)}
                                  disabled={applying}
                                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  {applying ? 'Applying...' : 'Apply Now'}
                                </button>
                              )}
                              <span className="text-xs text-gray-500">
                                Posted {new Date(job.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'applications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Applications</h2>
                
                {applicationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Apply to jobs to track your progress here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application: Application) => (
                      <div key={application.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{application.job_title}</h3>
                            <p className="text-gray-600 mt-1">Company: {application.employer_name}</p>
                            <p className="text-gray-500 text-sm mt-2">
                              Applied: {new Date(application.applied_at).toLocaleDateString()}
                            </p>
                            <p className="text-gray-500 text-sm">
                              Last updated: {new Date(application.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`status-badge status-${application.status}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;