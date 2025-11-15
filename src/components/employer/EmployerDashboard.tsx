import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetEmployerJobsQuery, useCreateJobMutation } from '../../store/api/jobsApi';
import { useGetEmployerApplicationsQuery, useUpdateApplicationStatusMutation } from '../../store/api/applicationsApi';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { type Job } from '../../store/api/jobsApi';
import { type Application } from '../../store/api/applicationsApi';

const EmployerDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);

  const { 
    data: jobsData, 
    isLoading: jobsLoading, 
    error: jobsError,
    refetch: refetchJobs 
  } = useGetEmployerJobsQuery();

  const { 
    data: applicationsData, 
    isLoading: applicationsLoading, 
    refetch: refetchApplications 
  } = useGetEmployerApplicationsQuery();

  const [createJob, { isLoading: creatingJob }] = useCreateJobMutation();
  const [updateApplicationStatus, { isLoading: updatingStatus }] = useUpdateApplicationStatusMutation();

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: ''
  });

  // ===== Helper Functions =====
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'shortlisted': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatusOptions = (currentStatus: string) => {
    const statusFlow: { [key: string]: string[] } = {
      'applied': ['viewed', 'shortlisted', 'rejected'],
      'viewed': ['shortlisted', 'rejected'],
      'shortlisted': ['accepted', 'rejected'],
      'rejected': [],
      'accepted': []
    };
    return statusFlow[currentStatus] || [];
  };

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    try {
      const result = await updateApplicationStatus({ applicationId, status: newStatus }).unwrap();
      if (result.success) {
        refetchApplications();
      }
    } catch (error) {
      console.error('Failed to update application status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob(jobForm).unwrap();
      setShowJobForm(false);
      setJobForm({ title: '', description: '', requirements: '', location: '', salary: '' });
      refetchJobs();
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

  if (jobsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading employer dashboard...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => {
                    const appliedDate = new Date(app.applied_at);
                    const now = new Date();
                    return appliedDate.getMonth() === now.getMonth() &&
                           appliedDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
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
                My Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'applications'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Applications ({applications.length})
              </button>
            </nav>
          </div>

          <div className="p-6">

            {/* Applications Tab */}
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
                    <p className="mt-1 text-sm text-gray-500">
                      Applications will appear here when candidates apply to your jobs.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.map((application: Application) => {
                      const nextStatusOptions = getNextStatusOptions(application.status);

                      return (
                        <div key={application.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                          
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{application.job_title}</h3>
                              <p className="text-gray-600 mt-1"><strong>Applicant:</strong> {application.employee_name}</p>
                              <p className="text-gray-500 text-sm mt-2">
                                <strong>Applied:</strong> {new Date(application.applied_at).toLocaleDateString()} at {new Date(application.applied_at).toLocaleTimeString()}
                              </p>
                              <p className="text-gray-500 text-sm"><strong>Application ID:</strong> {application.id}</p>

                              {/* Resume Display with Download */}
                              {application.resume_filename && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm font-medium text-gray-700">Resume Attached:</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-sm text-gray-600">
                                      {application.resume_filename}
                                      {application.file_size && (
                                        <span className="text-xs text-gray-500 ml-2">
                                          ({(application.file_size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                      )}
                                    </span>

                                    <a
                                      href={`http://localhost:3001/uploads/resumes/${application.resume_filename}`}
                                      download={application.resume_filename} // <-- Forces download
                                      className="px-3 py-1 bg-sky-100 text-sky-700 rounded text-sm hover:bg-sky-200 transition-colors"
                                    >
                                      Download
                                    </a>
                                  </div>
                                </div>
                              )}

                            </div>

                            {/* Status Badge */}
                            <div className="ml-4 text-right">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          {/* Status Update Buttons */}
                          {nextStatusOptions.length > 0 && (
                            <div className="border-t pt-4 mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Update Status:</p>
                              <div className="flex flex-wrap gap-2">
                                {nextStatusOptions.map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(application.id, status)}
                                    disabled={updatingStatus}
                                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                      status === 'viewed'
                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                        : status === 'shortlisted'
                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                        : status === 'accepted'
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : status === 'rejected'
                                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    } disabled:opacity-50`}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Final Messages */}
                          {(application.status === 'accepted' || application.status === 'rejected') && (
                            <div className={`mt-4 p-3 rounded-lg ${
                              application.status === 'accepted' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                              <p className={`text-sm font-medium ${application.status === 'accepted' ? 'text-green-800' : 'text-red-800'}`}>
                                {application.status === 'accepted'
                                  ? '🎉 Congratulations! This candidate has been accepted.'
                                  : 'This application has been rejected.'}
                              </p>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Job Postings</h2>
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
                  >
                    Post New Job
                  </button>
                </div>

                {jobsError ? (
                  <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      Error loading jobs. Please try again.
                    </div>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by posting your first job.</p>
                    <button
                      onClick={() => setShowJobForm(true)}
                      className="mt-4 bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
                    >
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job: Job) => (
                      <div key={job.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-gray-600 mt-1">{job.location} • {job.salary}</p>
                            <p className="text-gray-500 text-sm mt-2">{job.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {job.is_active ? 'Active' : 'Inactive'}
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

        {/* Job Form Modal */}
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
                  <input type="text" id="title" name="title" required value={jobForm.title} onChange={handleJobFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
                  <textarea id="description" name="description" required rows={4} value={jobForm.description} onChange={handleJobFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">Requirements</label>
                  <textarea id="requirements" name="requirements" required rows={3} value={jobForm.requirements} onChange={handleJobFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input type="text" id="location" name="location" required value={jobForm.location} onChange={handleJobFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                  </div>

                  <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary</label>
                    <input type="text" id="salary" name="salary" required value={jobForm.salary} onChange={handleJobFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowJobForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={creatingJob} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50">{creatingJob ? 'Posting...' : 'Post Job'}</button>
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
