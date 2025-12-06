import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  useGetEmployerJobsQuery, 
  useCreateJobMutation, 
  useUpdateJobMutation,
  useDeleteJobMutation,
  useToggleJobStatusMutation 
} from '../../store/api/jobsApi';
import { useGetEmployerApplicationsQuery, useUpdateApplicationStatusMutation } from '../../store/api/applicationsApi';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { type Job } from '../../store/api/jobsApi';
import { type Application } from '../../store/api/applicationsApi';
// Update your Application interface (if you have one locally)


const EmployerDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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
  const [updateJob, { isLoading: updatingJob }] = useUpdateJobMutation();
  const [toggleJobStatus, { isLoading: togglingStatus }] = useToggleJobStatusMutation();
  const [deleteJob, { isLoading: deletingJob }] = useDeleteJobMutation();
  const [updateApplicationStatus, { isLoading: updatingStatus }] = useUpdateApplicationStatusMutation();

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    job_type: ''
  });

  // ===== Enhanced Helper Functions =====
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'viewed': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'shortlisted': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
      case 'accepted': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
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

  const handleToggleStatus = async (jobId: number) => {
    try {
      await toggleJobStatus(jobId).unwrap();
      refetchJobs();
    } catch (error) {
      console.error('Failed to toggle job status:', error);
      alert('Failed to update job status. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      const result = await deleteJob(jobId).unwrap();
      if (result.success) {
        setDeleteConfirm(null);
        refetchJobs();
      }
    } catch (error: any) {
      console.error('Failed to delete job:', error);
      if (error.data?.error) {
        alert(error.data.error);
      } else {
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (!showJobForm) {
      setEditingJob(null);
      setJobForm({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salary: '',
        job_type: ''
      });
    }
  }, [showJobForm]);

  useEffect(() => {
    if (editingJob) {
      setJobForm({
        title: editingJob.title,
        description: editingJob.description,
        requirements: editingJob.requirements,
        location: editingJob.location,
        salary: editingJob.salary,
        job_type: editingJob.job_type
      });
    }
  }, [editingJob]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob(jobForm).unwrap();
      setShowJobForm(false);
      setJobForm({ title: '', description: '', requirements: '', location: '', salary: '',job_type:'' });
      refetchJobs();
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    
    try {
      await updateJob({ jobId: editingJob.id, jobData: jobForm }).unwrap();
      setShowJobForm(false);
      setEditingJob(null);
      setJobForm({ title: '', description: '', requirements: '', location: '', salary: '',job_type:''  });
      refetchJobs();
    } catch (error) {
      console.error('Failed to update job:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading employer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
            Employer Dashboard
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your job postings, track applications, and find the perfect candidates for your team
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{jobs.filter(job => job.is_active).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900">
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

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-sky-100 mb-6 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-5 px-8 text-lg font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === 'jobs'
                    ? 'border-sky-500 text-sky-600 bg-white rounded-t-lg shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-sky-600 hover:bg-white/50'
                }`}
              >
                📋 My Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-5 px-8 text-lg font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === 'applications'
                    ? 'border-sky-500 text-sky-600 bg-white rounded-t-lg shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-sky-600 hover:bg-white/50'
                }`}
              >
                📨 Applications ({applications.length})
              </button>
            </nav>
          </div>

          <div className="p-8">

            {/* Enhanced Applications Tab */}
            {activeTab === 'applications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <span className="bg-gradient-to-r from-sky-500 to-blue-600 p-2 rounded-lg mr-3">
                    📨
                  </span>
                  Job Applications
                </h2>
                
                {applicationsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-sky-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Applications will appear here when candidates apply to your active job postings.
                    </p>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      View Your Jobs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.map((application: Application) => {
                      const nextStatusOptions = getNextStatusOptions(application.status);

                      return (
                        // In the applications.map section, update the application card:

<div key={application.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
  
  {/* Application Header */}
  <div className="flex justify-between items-start mb-4">
    <div className="flex-1">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{application.job_title}</h3>
      
      {/* Applicant Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">👤 Applicant:</span>
          {application.employee_name}
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">📞 Phone:</span>
          {application.phone_number || 'Not provided'}
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">📍 Location:</span>
          {application.location || 'Not provided'}
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">📅 Applied:</span>
          {new Date(application.applied_at).toLocaleDateString()} at {new Date(application.applied_at).toLocaleTimeString()}
        </div>
      </div>

      {/* NEW: Cover Letter Section */}
      {application.cover_letter && (
        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            📝 Cover Letter
          </p>
          <div className="max-h-40 overflow-y-auto pr-2">
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {application.cover_letter.length > 500 
                ? application.cover_letter.substring(0, 500) + '...' 
                : application.cover_letter}
            </p>
            {application.cover_letter.length > 500 && (
              <button
                onClick={() => {
                  // You can add a modal to view full cover letter
                  alert(application.cover_letter);
                }}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium mt-2"
              >
                Read full cover letter →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Resume Display */}
      {application.resume_filename && (
        <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            📄 Resume Attached
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600 block">
                {application.resume_filename}
              </span>
              {application.file_size && (
                <span className="text-xs text-gray-500">
                  ({(application.file_size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>
            <a
              href={`http://localhost:3001${application.resume_url}`}
              download={application.resume_filename}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </div>

    {/* Status Badge */}
    <div className="ml-4 text-right">
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(application.status)} shadow-sm`}>
        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
      </span>
    </div>
  </div>

  {/* Status Update Buttons (keep existing) */}
  {nextStatusOptions.length > 0 && (
    <div className="border-t pt-4 mt-4">
      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        🎯 Update Status:
      </p>
      <div className="flex flex-wrap gap-3">
        {nextStatusOptions.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusUpdate(application.id, status)}
            disabled={updatingStatus}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 ${
              status === 'viewed'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                : status === 'shortlisted'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                : status === 'accepted'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
                : status === 'rejected'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )}

  {/* Final Messages (keep existing) */}
  {(application.status === 'accepted' || application.status === 'rejected') && (
    <div className={`mt-4 p-4 rounded-xl border ${
      application.status === 'accepted' 
        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
        : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
    }`}>
      <p className={`text-sm font-semibold flex items-center ${
        application.status === 'accepted' ? 'text-emerald-800' : 'text-red-800'
      }`}>
        {application.status === 'accepted'
          ? '🎉 Congratulations! This candidate has been accepted.'
          : '❌ This application has been rejected.'}
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

            {/* Enhanced Jobs Tab */}
            {activeTab === 'jobs' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="bg-gradient-to-r from-sky-500 to-blue-600 p-2 rounded-lg mr-3">
                      📋
                    </span>
                    Job Postings
                  </h2>
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post New Job
                  </button>
                </div>

                {jobsError ? (
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl font-medium">
                      Error loading jobs. Please try again.
                    </div>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border-2 border-dashed border-sky-300">
                    <div className="w-20 h-20 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-600 mb-6">Start by creating your first job posting to attract talent.</p>
                    <button
                      onClick={() => setShowJobForm(true)}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {jobs.map((job: Job) => (
                      <div key={job.id} className={`rounded-2xl p-6 border transition-all duration-200 hover:shadow-lg ${
                        job.is_active 
                          ? 'bg-white border-sky-200 shadow-md' 
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 opacity-90'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                              <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                                job.is_active 
                                  ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' 
                                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300'
                              }`}>
                                {job.is_active ? '🟢 Active' : '⚫ Inactive'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center text-gray-700">
                                <span className="font-semibold mr-2">📍 Location:</span>
                                {job.location}
                              </div>
                              <div className="flex items-center text-gray-700">
                                <span className="font-semibold mr-2">💰 Salary:</span>
                                {job.salary}
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-700 mb-2">📝 Description:</h4>
                              <p className="text-gray-600 leading-relaxed">{job.description}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">✅ Requirements:</h4>
                              <p className="text-gray-600 leading-relaxed">{job.requirements}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Action Buttons */}
                        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setEditingJob(job);
                              setShowJobForm(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(job.id)}
                            disabled={togglingStatus}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center ${
                              job.is_active 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700' 
                                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
                            }`}
                          >
                            {togglingStatus ? '⏳' : job.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                          </button>
                          
                          <button
                            onClick={() => setDeleteConfirm(job.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                        
                        {/* Enhanced Delete Confirmation */}
                        {deleteConfirm === job.id && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                            <p className="text-red-800 font-semibold mb-3 flex items-center">
                              ⚠️ Are you sure you want to permanently delete this job?
                            </p>
                            <p className="text-red-700 text-sm mb-3">
                              This action cannot be undone and will remove all job data including applications.
                            </p>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                disabled={deletingJob}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200"
                              >
                                {deletingJob ? '🗑️ Deleting...' : '🗑️ Yes, Delete Permanently'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg text-sm font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Enhanced Job Creation/Edit Modal */}
                {/* Enhanced Job Creation/Edit Modal */}
        {showJobForm && (
          <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            {/* Gradient Background Overlay */}
            <div className="fixed inset-0 bg-gradient-to-br from-sky-400/20 via-blue-500/20 to-purple-600/20 backdrop-blur-sm"></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-sky-200 transform transition-all duration-300 scale-100">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-t-2xl p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">
                    {editingJob ? '✏️ Edit Job' : '🚀 Post a New Job'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                    }}
                    className="text-white hover:text-sky-100 transition-colors duration-200 p-2 rounded-full hover:bg-white/20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">🎯 Job Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={jobForm.title}
                      onChange={handleJobFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-gray-50"
                      placeholder="e.g., Senior Frontend Developer"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">📍 Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      required
                      value={jobForm.location}
                      onChange={handleJobFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-gray-50"
                      placeholder="e.g., Remote, New York, NY"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="salary" className="block text-sm font-semibold text-gray-700 mb-2">💰 Salary Range</label>
                  <input
                    type="text"
                    id="salary"
                    name="salary"
                    required
                    value={jobForm.salary}
                    onChange={handleJobFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-gray-50"
                    placeholder="e.g., $80,000 - $120,000"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">📝 Job Description</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    value={jobForm.description}
                    onChange={handleJobFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-gray-50 resize-vertical"
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                  />
                </div>
                
                <div>
                  <label htmlFor="requirements" className="block text-sm font-semibold text-gray-700 mb-2">✅ Requirements & Qualifications</label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    required
                    rows={3}
                    value={jobForm.requirements}
                    onChange={handleJobFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-gray-50 resize-vertical"
                    placeholder="List the required skills, experience, and qualifications..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingJob || updatingJob}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    {creatingJob ? '⏳ Posting...' : updatingJob ? '⏳ Updating...' : editingJob ? '💾 Update Job' : '🚀 Post Job'}
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