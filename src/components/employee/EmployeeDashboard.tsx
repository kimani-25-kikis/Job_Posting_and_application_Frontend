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
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF or Word document');
        return;
      }
      
      // Validate file size (5MB)
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

      // Upload resume if provided
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

      // Apply for job
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Stats - keep existing */}

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
                                  onClick={() => handleApply(job)}
                                  disabled={applying}
                                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  Apply Now
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
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{application.job_title}</h3>
                            <p className="text-gray-600 mt-1">Company: {application.employer_name}</p>
                            <p className="text-gray-500 text-sm mt-2">
                              Applied: {new Date(application.applied_at).toLocaleDateString()}
                            </p>
                            <p className="text-gray-500 text-sm">
                              Last updated: {new Date(application.updated_at).toLocaleDateString()}
                            </p>
                            
                            {/* Resume Info */}
                            {application.resume_filename && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600">
                                  <strong>Resume:</strong> {application.resume_filename}
                                  {application.resume_url && (
                                    <a 
                                      href={`http://localhost:3001${application.resume_url}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      (Download)
                                    </a>
                                  )}
                                </p>
                              </div>
                            )}
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

        {/* Apply Modal */}
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Apply for {selectedJob.title}</h3>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedJob(null);
                    setResumeFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Resume (Optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    PDF or Word documents only. Max 5MB.
                  </p>
                  {resumeFile && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {resumeFile.name}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplyModal(false);
                      setSelectedJob(null);
                      setResumeFile(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitApplication}
                    disabled={applying || uploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {(applying || uploading) ? 'Submitting...' : 'Submit Application'}
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