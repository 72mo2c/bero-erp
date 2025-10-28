// ======================================
// TabBar - شريط التبويبات الحقيقي
// ======================================

import React from 'react';
import { FaTimes, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTab } from '../../contexts/TabContext';

const TabBar = () => {
  const { tabs, activeTabId, closeTab, switchTab, openNewTab } = useTab();
  const { logout } = useAuth();
  const navigate = useNavigate();
   const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-9 flex items-center gap-2 px-3 overflow-x-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">
      {/* التبويبات */}
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          
          return (
            <div
              key={tab.id}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-t-lg transition-all cursor-pointer group relative
                min-w-[140px] max-w-[220px] flex-shrink-0
                ${
                  isActive
                    ? 'bg-white shadow-lg border-t-2 border-l border-r border-orange-500 -mb-[1px] z-10'
                    : 'bg-white/60 hover:bg-white/90 border border-transparent hover:border-orange-300/50 shadow-sm'
                }
              `}
              onClick={() => switchTab(tab.id)}
            >
              {/* أيقونة التبويب */}
              <span className={`text-base flex-shrink-0 transition-transform ${
                isActive ? 'scale-110' : 'group-hover:scale-105'
              }`}>{tab.icon}</span>
              
              {/* عنوان التبويب */}
              <span 
                className={`
                  text-sm font-semibold truncate flex-1
                  ${isActive ? 'text-orange-600' : 'text-gray-600 group-hover:text-gray-800'}
                `}
                title={tab.title}
              >
                {tab.title}
              </span>

              {/* زر الإغلاق (فقط للتبويبات الإضافية) */}
              {!tab.isMain && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={`
                    flex-shrink-0 p-1 rounded-md transition-all
                    ${
                      isActive
                        ? 'text-orange-500 hover:bg-orange-100 hover:text-orange-700'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                    }
                  `}
                  title="إغلاق التبويب"
                >
                  <FaTimes size={11} />
                </button>
              )}

              {/* مؤشر التبويب النشط */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 rounded-t-full" />
              )}
            </div>
          );
        })}
      </div>
      {/* زر تسجيل الخروج */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center w-8 h-8 text-orange-600 hover:text-white bg-orange-50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-orange-600 rounded-lg transition-all shadow-sm hover:shadow-md flex-shrink-0 ml-1"
        title="تسجيل الخروج"
      >
        <FaSignOutAlt size={13} className="font-bold" />
        </button>
          {/* زر تبويب جديد */}
      <button
        onClick={openNewTab}
        className="flex items-center justify-center w-8 h-8 text-orange-600 hover:text-white bg-orange-50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-orange-600 rounded-lg transition-all shadow-sm hover:shadow-md flex-shrink-0 ml-1"
        title="تبويب جديد (Ctrl+T)"
      >
        <FaPlus size={13} className="font-bold" />
      </button>
      
        
    </div>
  );
};

export default TabBar;