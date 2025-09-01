import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, User, LogOut, History, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Car className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">RideShare</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.firstName}
                  </span>
                  
                  {user.userType === 'driver' ? (
                    <Link
                      to="/dashboard"
                      className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive('/dashboard') 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Driver Dashboard
                    </Link>
                  ) : (
                    <div className="flex space-x-2">
                      <Link
                        to="/book-ride"
                        className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                          isActive('/book-ride') 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        Book Ride
                      </Link>
                      <Link
                        to="/ride-history"
                        className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                          isActive('/ride-history') 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <History className="h-4 w-4 mr-1" />
                        History
                      </Link>
                      <Link
                        to="/payment-history"
                        className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                          isActive('/payment-history') 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Payments
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <User className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-gray-100 text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;