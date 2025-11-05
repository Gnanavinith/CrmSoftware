import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10" />
        </svg>
      ),
    },
    {
      path: '/attendance',
      label: 'Attendance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      path: '/clients',
      label: 'Clients',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      path: '/projects',
      label: 'Projects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
    },
    {
      path: '/tasks',
      label: 'Tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const bottomMenuItems = [
    {
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-500 flex flex-col relative group ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div 
              className="flex items-center space-x-3 transition-all duration-300"
              onMouseEnter={() => setActiveHover('logo')}
              onMouseLeave={() => setActiveHover(null)}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="font-bold text-white text-sm">CRM</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Software CRM
                </h1>
                <p className="text-xs text-gray-400 font-medium">Consulting Pro</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="relative mx-auto">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="font-bold text-white text-sm">CRM</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105"
          >
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-500 ${
                isCollapsed ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700/50">
          <div 
            className="flex items-center space-x-3 p-3 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 cursor-pointer"
            onMouseEnter={() => setActiveHover('user')}
            onMouseLeave={() => setActiveHover(null)}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-semibold text-white text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-gray-900 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.position || 'Team Member'}</p>
              <p className="text-xs text-blue-400 font-medium mt-1">Online</p>
            </div>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="p-4 border-b border-gray-700/50 flex justify-center">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-semibold text-white text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="space-y-2 px-4">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/25 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50 backdrop-blur-sm border border-transparent hover:border-gray-700/50'
              } ${isCollapsed ? 'justify-center' : ''}`}
              style={{
                transitionDelay: isCollapsed ? '0ms' : `${index * 50}ms`
              }}
              onMouseEnter={() => setActiveHover(item.path)}
              onMouseLeave={() => setActiveHover(null)}
            >
              {/* Active indicator */}
              {isActive(item.path) && (
                <div className="absolute left-0 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"></div>
              )}
              
              <div className={`transition-all duration-300 ${
                isActive(item.path) 
                  ? 'text-white scale-110' 
                  : activeHover === item.path 
                    ? 'scale-105 text-blue-400' 
                    : 'text-gray-400'
              }`}>
                {item.icon}
              </div>
              
              {!isCollapsed && (
                <span className="ml-3 font-medium transition-all duration-300">
                  {item.label}
                </span>
              )}
              
              {/* Hover tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl border border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 backdrop-blur-sm">
                  {item.label}
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="px-4 my-6">
          <div className="border-t border-gray-700/50"></div>
        </div>

        {/* Bottom Menu */}
        <div className="space-y-2 px-4">
          {bottomMenuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/25 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50 backdrop-blur-sm border border-transparent hover:border-gray-700/50'
              } ${isCollapsed ? 'justify-center' : ''}`}
              style={{
                transitionDelay: isCollapsed ? '0ms' : `${index * 50}ms`
              }}
              onMouseEnter={() => setActiveHover(item.path)}
              onMouseLeave={() => setActiveHover(null)}
            >
              {isActive(item.path) && (
                <div className="absolute left-0 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"></div>
              )}
              
              <div className={`transition-all duration-300 ${
                isActive(item.path) 
                  ? 'text-white scale-110' 
                  : activeHover === item.path 
                    ? 'scale-105 text-blue-400' 
                    : 'text-gray-400'
              }`}>
                {item.icon}
              </div>
              
              {!isCollapsed && (
                <span className="ml-3 font-medium transition-all duration-300">
                  {item.label}
                </span>
              )}
              
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl border border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 backdrop-blur-sm">
                  {item.label}
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={logout}
          className={`relative flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${
            isCollapsed ? 'justify-center' : ''
          } text-gray-400 hover:text-white hover:bg-red-500/20 backdrop-blur-sm border border-transparent hover:border-red-500/30`}
          onMouseEnter={() => setActiveHover('logout')}
          onMouseLeave={() => setActiveHover(null)}
        >
          <svg className={`w-5 h-5 transition-all duration-300 ${
            activeHover === 'logout' ? 'scale-110 text-red-400' : 'text-gray-400'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          
          {!isCollapsed && (
            <span className="ml-3 font-medium transition-all duration-300">
              Logout
            </span>
          )}
          
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl border border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 backdrop-blur-sm">
              Logout
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}
        </button>
      </div>

      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
    </div>
  );
};

export default Sidebar;