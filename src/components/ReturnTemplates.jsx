// ======================================
// Return Templates Component - قوالب المرتجعات السريعة
// ======================================

import React, { useState } from 'react';
import { 
  FaBoxes, 
  FaTruck, 
  FaExclamationTriangle, 
  FaUser, 
  FaColor,
  FaRuler,
  FaSmile,
  FaCheck,
  FaClock,
  FaCog,
  FaPlus,
  FaSave,
  FaTrash,
  FaEdit,
  FaCopy
} from 'react-icons/fa';

const ReturnTemplates = ({ 
  type = 'purchase', // purchase or sales
  onApplyTemplate,
  onSaveCustomTemplate,
  customTemplates = [],
  onDeleteCustomTemplate
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customTemplateName, setCustomTemplateName] = useState('');
  const [customTemplateDescription, setCustomTemplateDescription] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set(['common']));

  // Predefined templates based on type
  const getTemplates = () => {
    if (type === 'purchase') {
      return {
        common: [
          {
            id: 'defective',
            name: 'إرجاع منتج معيب',
            description: 'المنتج به عيب في التصنيع أو الجودة',
            icon: FaExclamationTriangle,
            color: 'bg-red-50 border-red-200 text-red-700',
            iconColor: 'text-red-600',
            defaultReason: 'defective',
            items: []
          },
          {
            id: 'damaged',
            name: 'إرجاع منتج تالف',
            description: 'المنتج تالف أثناء النقل أو التخزين',
            icon: FaTruck,
            color: 'bg-orange-50 border-orange-200 text-orange-700',
            iconColor: 'text-orange-600',
            defaultReason: 'damaged',
            items: []
          },
          {
            id: 'wrong_item',
            name: 'إرجاع منتج خاطئ',
            description: 'تم إرسال منتج مختلف عن المطلوب',
            icon: FaBoxes,
            color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
            iconColor: 'text-yellow-600',
            defaultReason: 'wrong_item',
            items: []
          },
          {
            id: 'expired',
            name: 'إرجاع منتج منتهي الصلاحية',
            description: 'المنتج منتهي الصلاحية أو قارب على الانتهاء',
            icon: FaClock,
            color: 'bg-purple-50 border-purple-200 text-purple-700',
            iconColor: 'text-purple-600',
            defaultReason: 'expired',
            items: []
          },
          {
            id: 'excess',
            name: 'إرجاع كمية زائدة',
            description: 'تم إرسال كمية أكبر من المطلوبة',
            icon: FaPlus,
            color: 'bg-blue-50 border-blue-200 text-blue-700',
            iconColor: 'text-blue-600',
            defaultReason: 'excess',
            items: []
          }
        ]
      };
    } else {
      return {
        common: [
          {
            id: 'customer_request',
            name: 'طلب العميل',
            description: 'إرجاع بناءً على طلب مباشر من العميل',
            icon: FaUser,
            color: 'bg-green-50 border-green-200 text-green-700',
            iconColor: 'text-green-600',
            defaultReason: 'customer_request',
            items: []
          },
          {
            id: 'defective',
            name: 'إرجاع منتج معيب',
            description: 'العميل اشتكى من عيب في المنتج',
            icon: FaExclamationTriangle,
            color: 'bg-red-50 border-red-200 text-red-700',
            iconColor: 'text-red-600',
            defaultReason: 'defective',
            items: []
          },
          {
            id: 'wrong_item',
            name: 'إرجاع منتج خاطئ',
            description: 'تم بيع منتج مختلف عن المطلوب',
            icon: FaBoxes,
            color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
            iconColor: 'text-yellow-600',
            defaultReason: 'wrong_item',
            items: []
          },
          {
            id: 'wrong_color',
            name: 'إرجاع لون خاطئ',
            description: 'اللون لا يتطابق مع توقعات العميل',
            icon: FaColor,
            color: 'bg-pink-50 border-pink-200 text-pink-700',
            iconColor: 'text-pink-600',
            defaultReason: 'wrong_color',
            items: []
          },
          {
            id: 'wrong_size',
            name: 'إرجاع مقاس خاطئ',
            description: 'المقاس لا يناسب العميل',
            icon: FaRuler,
            color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
            iconColor: 'text-indigo-600',
            defaultReason: 'wrong_size',
            items: []
          },
          {
            id: 'not_satisfied',
            name: 'عدم الرضا',
            description: 'العميل غير راضٍ عن المنتج أو الخدمة',
            icon: FaSmile,
            color: 'bg-gray-50 border-gray-200 text-gray-700',
            iconColor: 'text-gray-600',
            defaultReason: 'not_satisfied',
            items: []
          }
        ]
      };
    }
  };

  const templates = getTemplates();

  // Toggle expanded section
  const toggleSection = (sectionKey) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  // Apply template
  const handleApplyTemplate = (template) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
    }
  };

  // Save custom template
  const handleSaveTemplate = () => {
    if (!customTemplateName.trim()) return;

    const customTemplate = {
      id: `custom_${Date.now()}`,
      name: customTemplateName,
      description: customTemplateDescription || template.name,
      icon: FaCog,
      color: 'bg-gray-50 border-gray-200 text-gray-700',
      iconColor: 'text-gray-600',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    if (onSaveCustomTemplate) {
      onSaveCustomTemplate(customTemplate);
    }

    setCustomTemplateName('');
    setCustomTemplateDescription('');
    setShowSaveDialog(false);
  };

  // Delete custom template
  const handleDeleteCustomTemplate = (template) => {
    if (onDeleteCustomTemplate && confirm(`هل أنت متأكد من حذف القالب "${template.name}"؟`)) {
      onDeleteCustomTemplate(template);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">قوالب الإرجاع السريع</h3>
          <p className="text-gray-600">اختر قالباً لتسريع عملية إنشاء الإرجاع</p>
        </div>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaSave />
          حفظ قالب مخصص
        </button>
      </div>

      {/* Templates Sections */}
      <div className="space-y-6">
        {/* Common Templates */}
        <div>
          <button
            onClick={() => toggleSection('common')}
            className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h4 className="font-semibold text-gray-800">القوالب الشائعة</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{templates.common.length} قالب</span>
              <FaCog className={`transition-transform ${expandedSections.has('common') ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSections.has('common') && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.common.map((template) => {
                const IconComponent = template.icon;
                return (
                  <div
                    key={template.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${template.color}`}
                    onClick={() => handleApplyTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className={`text-2xl ${template.iconColor} flex-shrink-0 mt-1`} />
                      <div className="flex-1">
                        <h5 className="font-semibold mb-1">{template.name}</h5>
                        <p className="text-sm opacity-80">{template.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTemplate(template);
                        }}
                        className="text-xs px-3 py-1 bg-white bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
                      >
                        تطبيق القالب
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Templates */}
        {customTemplates.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('custom')}
              className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h4 className="font-semibold text-gray-800">القوالب المخصصة</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{customTemplates.length} قالب</span>
                <FaCog className={`transition-transform ${expandedSections.has('custom') ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {expandedSections.has('custom') && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customTemplates.map((template) => {
                  const IconComponent = template.icon || FaCog;
                  return (
                    <div
                      key={template.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${template.color}`}
                      onClick={() => handleApplyTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className={`text-2xl ${template.iconColor} flex-shrink-0 mt-1`} />
                        <div className="flex-1">
                          <h5 className="font-semibold mb-1">{template.name}</h5>
                          <p className="text-sm opacity-80">{template.description}</p>
                          <p className="text-xs opacity-60 mt-1">
                            تم الإنشاء: {new Date(template.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTemplate(template);
                          }}
                          className="text-xs px-3 py-1 bg-white bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
                        >
                          تطبيق
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Duplicate template logic
                              const duplicated = {
                                ...template,
                                id: `custom_${Date.now()}`,
                                name: `${template.name} (نسخة)`,
                                createdAt: new Date().toISOString()
                              };
                              if (onSaveCustomTemplate) {
                                onSaveCustomTemplate(duplicated);
                              }
                            }}
                            className="text-xs p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="نسخ القالب"
                          >
                            <FaCopy />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomTemplate(template);
                            }}
                            className="text-xs p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title="حذف القالب"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Custom Template Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">حفظ قالب مخصص</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم القالب
                </label>
                <input
                  type="text"
                  value={customTemplateName}
                  onChange={(e) => setCustomTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل اسم القالب..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={customTemplateDescription}
                  onChange={(e) => setCustomTemplateDescription(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف مختصر للقالب..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!customTemplateName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="font-semibold text-blue-800 mb-2">💡 نصائح لاستخدام القوالب</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• استخدم القوالب لتسريع عملية إنشاء الإرجاع</li>
          <li>• يمكنك حفظ قوالب مخصصة للمنتجات الشائعة</li>
          <li>• القوالب تملأ المعلومات الأساسية تلقائياً</li>
          <li>• يمكن تعديل القالب بعد التطبيق حسب الحاجة</li>
        </ul>
      </div>
    </div>
  );
};

export default ReturnTemplates;