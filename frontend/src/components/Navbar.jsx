import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { LogOut, Layers } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition">
          <Layers size={28} className="text-indigo-600" />
          <span className="text-2xl font-black tracking-tight text-gray-900">
            Smart<span className="text-indigo-600">Task</span>
          </span>
        </Link>
        
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <span className="font-medium text-gray-600 hidden md:block">
                Hello, <span className="text-gray-900">{user?.name}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-4 py-2 rounded-lg transition duration-300 font-medium text-sm shadow-sm"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
