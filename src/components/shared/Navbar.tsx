import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectCurrentUser } from '../../store/slices/authSlice';
import { type AppDispatch } from '../../store/store';

const Navbar: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch<AppDispatch>();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getWelcomeMessage = () => {
    if (user?.user_type === 'employer') {
      return `Welcome back, ${user.name} 👋`;
    } else {
      return `Hello, ${user?.name} 🎯`;
    }
  };

  const getUserIcon = () => {
    if (user?.user_type === 'employer') {
      return '🏢';
    } else {
      return '💼';
    }
  };

  return (
    <>
      {/* Blur background when modal is open */}
      <div className={`${showLogoutConfirm ? 'fixed inset-0 backdrop-blur-sm bg-white/30 z-30' : ''}`}></div>
      
      <nav className={`bg-white shadow-lg border-b border-sky-100 sticky top-0 z-40 ${showLogoutConfirm ? 'blur-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                    Nexus Jobs
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {user?.user_type === 'employer' ? 'Employer Portal' : 'Career Platform'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-6">
              {/* Welcome Message */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-gray-700 font-medium text-sm">
                  {getWelcomeMessage()}
                </span>
                <span className="text-xs text-gray-500">
                  Ready to {user?.user_type === 'employer' ? 'find talent' : 'discover opportunities'}
                </span>
              </div>

              {/* User Badge */}
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${
                  user?.user_type === 'employer' 
                    ? 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200 text-sky-700' 
                    : 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700'
                } shadow-sm`}>
                  <span className="text-lg">{getUserIcon()}</span>
                  <span className="text-sm font-semibold">
                    {user?.user_type === 'employer' ? 'Employer' : 'Job Seeker'}
                  </span>
                </div>

                {/* Enhanced Logout Button */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="group flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-300 hover:border-gray-400"
                >
                  <svg 
                    className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600"></div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-sky-200 transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-t-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Confirm Logout</h3>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to leave?
                </h4>
                <p className="text-gray-600">
                  Are you sure you want to log out of your Nexus Jobs account?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  You'll need to sign in again to access your dashboard.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Yes, Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;