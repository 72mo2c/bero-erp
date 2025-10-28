import React from 'react';

const PageHeader = ({ title, subtitle, icon, actions, action }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="text-3xl text-blue-600">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {(actions || action) && (
          <div className="flex gap-2">
            {actions && Array.isArray(actions) ? (
              actions.map((actionItem, index) => (
                <button
                  key={index}
                  onClick={actionItem.onClick}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    actionItem.variant === 'primary'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {actionItem.label}
                </button>
              ))
            ) : (
              action
            )}
          </div>
        )}
      </div>
      <hr className="mt-4 border-gray-200" />
    </div>
  );
};

export default PageHeader;