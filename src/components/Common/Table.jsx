// ======================================
// Table Component - مكون الجدول
// ======================================

import React from 'react';
import Button from './Button';

const Table = ({ columns, data, onEdit, onDelete, onView, onReturn, actions = true }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b"
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                الإجراءات
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2 justify-end">
                      {onView && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onView(row)}
                        >
                          عرض
                        </Button>
                      )}
                      {onReturn && (
                        <Button 
                          variant="warning" 
                          size="sm" 
                          onClick={() => onReturn(row)}
                        >
                          إرجاع
                        </Button>
                      )}
                      {onEdit && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => onEdit(row)}
                        >
                          تعديل
                        </Button>
                      )}
                      {onDelete && (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => onDelete(row)}
                        >
                          حذف
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length + (actions ? 1 : 0)} 
                className="px-6 py-8 text-center text-gray-500"
              >
                لا توجد بيانات للعرض
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
