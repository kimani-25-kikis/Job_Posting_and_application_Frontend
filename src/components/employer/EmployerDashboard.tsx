import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetEmployerJobsQuery, useCreateJobMutation } from '../../store/api/jobsApi';
import { useGetEmployerApplicationsQuery } from '../../store/api/applicationsApi';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { type RootState } from '../../store/store';
import {type Job } from '../../store/api/jobsApi';
import { type Application } from '../../store/api/applicationsApi';

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
}

const EmployerDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  
  const { data: jobsData, isLoading: jobsLoading } = useGetEmployerJobsQuery();
  const { data: applicationsData, isLoading: applicationsLoading } = useGetEmployerApplicationsQuery();
  const [createJob, { isLoading: creatingJob }] = useCreateJobMutation();

  const [jobForm, setJobForm] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: ''
  });

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob(jobForm).unwrap();
      setShowJobForm(false);
      setJobForm({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salary: ''
      });
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleJobFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJobForm({
      ...jobForm,
      [e.target.name]: e.target.value
    });
  };

  const jobs = jobsData?.data || [];
  const applications = applicationsData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your job postings and applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-sky-100 rounded-lg">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{jobs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-sky-100 rounded-lg">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-sky-100 rounded-lg">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-semibold text-gray-900">{applications.filter(app => {
                  const appliedDate = new Date(app.applied_at);
                  const now = new Date();
                  return appliedDate.getMonth() === now.getMonth() && appliedDate.getFullYear() === now.getFullYear();
                }).length}</p>
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
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Jobs
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'applications'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Applications
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'jobs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Job Postings</h2>
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="btn-primary bg-sky-600 hover:bg-sky-700"
                  >
                    Post New Job
                  </button>
                </div>

                {jobsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading jobs...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by posting your first job.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job: Job) => (
                      <div key={job.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-gray-600 mt-1">{job.location} • {job.salary}</p>
                            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{job.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'applications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Applications</h2>
                
                {applicationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Applications will appear here when candidates apply to your jobs.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application: Application) => (
                      <div key={application.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{application.job_title}</h3>
                            <p className="text-gray-600 mt-1">Applicant: {application.employee_name}</p>
                            <p className="text-gray-500 text-sm mt-2">
                              Applied: {new Date(application.applied_at).toLocaleDateString()}
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

        {/* Job Creation Modal */}
        {showJobForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Post a New Job</h3>
                <button
                  onClick={() => setShowJobForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={jobForm.title}
                    onChange={handleJobFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    value={jobForm.description}
                    onChange={handleJobFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">Requirements</label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    required
                    rows={3}
                    value={jobForm.requirements}
                    onChange={handleJobFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      required
                      value={jobForm.location}
                      onChange={handleJobFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary</label>
                    <input
                      type="text"
                      id="salary"
                      name="salary"
                      required
                      value={jobForm.salary}
                      onChange={handleJobFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingJob}
                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50"
                  >
                    {creatingJob ? 'Posting...' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;