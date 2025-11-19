import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { type AppDispatch } from '../../store/store';
import { isSerializedError, isApiError } from '../../types/api';
import pic from "../../assets/Work1.avif";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  user_type: 'employer' | 'employee';
}

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [register, { isLoading }] = useRegisterMutation();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    user_type: 'employee'
  });

  const [formErrors, setFormErrors] = useState<Partial<RegisterFormData>>({});
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validateForm = (): boolean => {
    const errors: Partial<RegisterFormData> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.name) {
      errors.name = 'Name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!validateForm()) return;

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData).unwrap();
      
      if (result.success) {
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.token
        }));
      }
    } catch (err) {
      console.error('Registration failed:', err);
      
      // Handle different error types
      if (isSerializedError(err) && err.data) {
        setErrorMessage(err.data.error);
      } else if (isApiError(err)) {
        setErrorMessage(err.error);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (formErrors[e.target.name as keyof RegisterFormData]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: undefined
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-sky-500 to-blue-590 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <h2 className="mt-6 text-center text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              Join Nexus Jobs
            </h2>
            <p className="mt-3 text-center text-lg text-gray-600 font-medium">
              Create your account and start your journey
            </p>
          </div>
          
          {/* Registration Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={`block w-full px-4 py-3.5 border ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {formErrors.name && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`block w-full px-4 py-3.5 border ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm`}
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="user_type" className="block text-sm font-semibold text-gray-700 mb-2">
                  I want to
                </label>
                <div className="relative">
                  <select
                    id="user_type"
                    name="user_type"
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white shadow-sm appearance-none"
                    value={formData.user_type}
                    onChange={handleChange}
                  >
                    <option value="employee">Find Jobs</option>
                    <option value="employer">Hire Talent</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className={`block w-full px-4 py-3.5 border ${
                      formErrors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm`}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className={`block w-full px-4 py-3.5 border ${
                      formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Create your account
                    <svg className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
            
            {/* Sign In Link */}
            <div className="text-center pt-4">
              <p className="text-base text-gray-600">
                Already have an account?{' '}
                <a 
                  href="/login" 
                  className="font-semibold text-sky-600 hover:text-sky-700 transition-colors duration-200 underline underline-offset-4 hover:no-underline"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image with Gradient Background */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600">
          {/* Floating gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white p-12 w-full">
          <div className="max-w-lg">
            {/* Image Container with Enhanced Styling */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                {/* Image Shadow Effect */}
                <div className="absolute inset-0 bg-sky-200/30 rounded-2xl blur-lg transform scale-105"></div>
                {/* Main Image */}
                <img 
                  src={pic} 
                  alt="Career Opportunities" 
                  className="relative w-80 h-80 object-contain rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            
            {/* Text Content */}
            <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-sky-100 bg-clip-text text-transparent">
              Start Your Journey
            </h3>
            <p className="text-xl text-sky-100 leading-relaxed font-medium">
              Whether you're looking for your dream job or seeking exceptional talent, 
              Nexus Jobs connects opportunities with ambition. Join our community today.
            </p>
            
            {/* Feature Highlights */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sky-100 font-medium">Find Perfect Jobs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sky-100 font-medium">Hire Top Talent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sky-100 font-medium">Build Networks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sky-100 font-medium">Grow Career</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;