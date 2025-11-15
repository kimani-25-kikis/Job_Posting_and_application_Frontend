import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectCurrentUser } from '../../store/slices/authSlice';
import { type AppDispatch } from '../../store/store';

const Navbar: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
  };

  const getWelcomeMessage = () => {
    if (user?.user_type === 'employer') {
      return `Welcome, ${user.name}`;
    } else {
      return `Welcome back, ${user?.name}`;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Nexus Jobs</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700 text-sm">
              {getWelcomeMessage()}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              user?.user_type === 'employer' 
                ? 'bg-sky-100 text-sky-800' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {user?.user_type === 'employer' ? 'Employer' : 'Job Seeker'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;