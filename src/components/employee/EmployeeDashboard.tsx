import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetAllJobsQuery } from '../../store/api/jobsApi';
import { 
  useGetEmployeeApplicationsQuery, 
  useApplyForJobMutation,
  useUploadResumeMutation 
} from '../../store/api/applicationsApi';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { type RootState } from '../../store/store';
import { type Job } from '../../store/api/jobsApi';
import {type  Application } from '../../store/api/applicationsApi';

const EmployeeDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } = useGetAllJobsQuery();
  const { data: applicationsData, isLoading: applicationsLoading, refetch: refetchApplications } = useGetEmployeeApplicationsQuery();
  const [applyForJob, { isLoading: applying }] = useApplyForJobMutation();
  const [uploadResume, { isLoading: uploading }] = useUploadResumeMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF or Word document');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setResumeFile(file);
    }
  };

  const handleApply = async (job: Job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!selectedJob) return;

    try {
      let resumeData = null;

      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        const uploadResult = await uploadResume(formData).unwrap();
        if (uploadResult.success) {
          resumeData = {
            filename: uploadResult.data.filename,
            originalName: uploadResult.data.originalName,
            size: uploadResult.data.size
          };
        }
      }

      const result = await applyForJob({
        jobId: selectedJob.id,
        resumeData
      }).unwrap();

      if (result.success) {
        setShowApplyModal(false);
        setSelectedJob(null);
        setResumeFile(null);
        refetchApplications();
        refetchJobs();
      }
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

  // Enhanced status color function
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
            Job Seeker Dashboard
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover exciting opportunities and track your application progress
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'from-sky-500 to-blue-600', icon: '📊' },
            { label: 'Applied', value: stats.applied, color: 'from-blue-500 to-blue-600', icon: '📨' },
            { label: 'Viewed', value: stats.viewed, color: 'from-purple-500 to-purple-600', icon: '👀' },
            { label: 'Shortlisted', value: stats.shortlisted, color: 'from-amber-500 to-amber-600', icon: '⭐' },
            { label: 'Rejected', value: stats.rejected, color: 'from-red-500 to-red-600', icon: '❌' },
            { label: 'Accepted', value: stats.accepted, color: 'from-emerald-500 to-emerald-600', icon: '✅' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-4 border border-sky-100 transform hover:scale-105 transition-transform duration-200">
              <div className="text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md`}>
                  <span className="text-white text-lg">{stat.icon}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs font-semibold text-gray-600 mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
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
                🔍 Browse Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-5 px-8 text-lg font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === 'applications'
                    ? 'border-sky-500 text-sky-600 bg-white rounded-t-lg shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-sky-600 hover:bg-white/50'
                }`}
              >
                📋 My Applications ({applications.length})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'jobs' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <span className="bg-gradient-to-r from-sky-500 to-blue-600 p-2 rounded-lg mr-3">
                    🔍
                  </span>
                  Available Job Opportunities
                </h2>

                {jobsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Discovering amazing jobs...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-sky-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs available at the moment</h3>
                    <p className="text-gray-600 mb-6">Check back later for new exciting opportunities.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {jobs.map((job: Job) => {
                      const hasApplied = hasAppliedToJob(job.id);
                      
                      return (
                        <div key={job.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                  📅 {new Date(job.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center text-gray-700">
                                  <span className="font-semibold mr-2">🏢 Company:</span>
                                  {job.employer_name}
                                </div>
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
                                <h4 className="font-semibold text-gray-700 mb-2">📝 Job Description:</h4>
                                <p className="text-gray-600 leading-relaxed">{job.description}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-2">✅ Requirements:</h4>
                                <p className="text-gray-600 leading-relaxed">{job.requirements}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>🚀 Active Opportunity</span>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {hasApplied ? (
                                <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-lg text-sm font-semibold border border-emerald-200 shadow-sm">
                                  ✅ Applied
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleApply(job)}
                                  disabled={applying}
                                  className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Apply Now
                                </button>
                              )}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <span className="bg-gradient-to-r from-sky-500 to-blue-600 p-2 rounded-lg mr-3">
                    📋
                  </span>
                  My Application History
                </h2>
                
                {applicationsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border-2 border-dashed border-sky-300">
                    <div className="w-20 h-20 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-6">Start applying to jobs to track your progress here.</p>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Browse Jobs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.map((application: Application) => (
                      <div key={application.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{application.job_title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center text-gray-700">
                                <span className="font-semibold mr-2">🏢 Company:</span>
                                {application.employer_name}
                              </div>
                              <div className="flex items-center text-gray-700">
                                <span className="font-semibold mr-2">📅 Applied:</span>
                                {new Date(application.applied_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-gray-700">
                                <span className="font-semibold mr-2">🔄 Last Updated:</span>
                                {new Date(application.updated_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-gray-700">
                                <span className="font-semibold mr-2">🆔 Application ID:</span>
                                #{application.id}
                              </div>
                            </div>
                            
                            {/* Enhanced Resume Info */}
                            {application.resume_filename && (
                              <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
                                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                  📄 Resume Attached
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    {application.resume_filename}
                                  </span>
                                  {application.resume_url && (
                                    <a 
                                      href={`http://localhost:3001${application.resume_url}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                      Download
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Enhanced Status Badge */}
                          <div className="ml-4">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(application.status)}`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Apply Modal */}
                {/* Enhanced Apply Modal with Blur Background */}
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            {/* Blur Background Overlay */}
            <div className="fixed inset-0 bg-gradient-to-br from-sky-400/20 via-blue-500/20 to-purple-600/20 backdrop-blur-md"></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-sky-200 transform transition-all duration-300 scale-100">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-t-2xl p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    🚀 Apply for {selectedJob.title}
                  </h3>
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setSelectedJob(null);
                      setResumeFile(null);
                    }}
                    className="text-white hover:text-sky-100 transition-colors duration-200 p-2 rounded-full hover:bg-white/20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200">
                  <h4 className="font-semibold text-gray-700 mb-2">📋 Job Details</h4>
                  <p className="text-sm text-gray-600"><strong>Company:</strong> {selectedJob.employer_name}</p>
                  <p className="text-sm text-gray-600"><strong>Location:</strong> {selectedJob.location}</p>
                  <p className="text-sm text-gray-600"><strong>Salary:</strong> {selectedJob.salary}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    📄 Upload Resume (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-sky-400 transition-colors duration-200">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600 mb-1">
                        {resumeFile ? resumeFile.name : 'Click to upload resume'}
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF or Word documents only • Max 5MB
                      </p>
                    </label>
                  </div>
                  {resumeFile && (
                    <p className="text-sm text-emerald-600 mt-2 flex items-center">
                      ✅ Selected: {resumeFile.name}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplyModal(false);
                      setSelectedJob(null);
                      setResumeFile(null);
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitApplication}
                    disabled={applying || uploading}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    {(applying || uploading) ? '⏳ Submitting...' : '🚀 Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;