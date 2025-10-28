// ======================================
// Compact Header - شريط علوي مصغر ومميز
// ======================================

import React, { useState } from 'react';
import { FaBell, FaUser, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from '../Common/GlobalSearch';
import TabBar from './TabBar';

const Header = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-[40px] fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-all">
        {/* Tab Bar - شريط التبويبات */}
        <div className="border-t border-orange-200/50 bg-gradient-to-b from-orange-50/50 to-white">
          <TabBar />
        </div>
      </header>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="lg:hidden absolute top-full left-0 right-0 p-3 bg-white border-b border-orange-100 shadow-lg z-50">
          <GlobalSearch isMobile onClose={() => setShowMobileSearch(false)} />
        </div>
      )}
    </>
  );
};

export default Header;
