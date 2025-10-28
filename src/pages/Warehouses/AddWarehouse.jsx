// ======================================
// Add Warehouse - إضافة مخزن جديد
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaWarehouse, FaSave, FaArrowLeft } from 'react-icons/fa';

const AddWarehouse = () => {
  const navigate = useNavigate();
  const { addWarehouse, warehouses } = useData();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // التحقق من اسم المخزن
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المخزن مطلوب';
    } else {
      // التحقق من عدم تكرار الاسم
      const duplicateName = warehouses?.some(
        w => w.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );
      if (duplicateName) {
        newErrors.name = 'اسم المخزن موجود مسبقاً';
      }
    }

    // التحقق من العنوان
    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }

    // التحقق من رقم الهاتف (إذا تم إدخاله)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\+20[0-9]{9,10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ +20 ويتكون من 9-10 أرقام';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // إزالة رسالة الخطأ عند التعديل
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      const warehouseData = {
        ...formData,
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        manager: formData.manager.trim(),
        description: formData.description.trim(),
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      addWarehouse(warehouseData);
      showSuccess('تم إضافة المخزن بنجاح');
      
      // الانتقال إلى صفحة إدارة المخازن
      setTimeout(() => {
        navigate('/warehouses/manage');
      }, 1000);
    } catch (error) {
      showError('حدث خطأ في إضافة المخزن');
      console.error('Error adding warehouse:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      manager: '',
      description: ''
    });
    setErrors({});
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaWarehouse className="text-orange-500" />
            إضافة مخزن جديد
          </h1>
          <p className="text-gray-600 mt-2">أدخل معلومات المخزن الجديد</p>
        </div>
        <Button
          variant="secondary"
          icon={<FaArrowLeft />}
          onClick={() => navigate('/warehouses/manage')}
        >
          العودة
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="اسم المخزن"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: المخزن الرئيسي - القاهرة"
                required
                error={errors.name}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Input
                label="العنوان"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="أدخل عنوان المخزن في مصر"
                required
                error={errors.address}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <Input
                label="رقم الهاتف"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+20 XXX XXX XXXX"
                error={errors.phone}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">يجب أن يبدأ بـ +20</p>
            </div>

            <div>
              <Input
                label="مدير المخزن"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                placeholder="اسم المدير المسؤول"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وصف المخزن (اختياري)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              placeholder="أدخل وصف المخزن، الموقع، المميزات، إلخ..."
            />
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button type="submit" variant="success" icon={<FaSave />}>
              حفظ المخزن
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={handleReset}
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </Card>

      {/* نصائح */}
      <Card className="mt-6 bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-2xl">💡</div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">نصائح مهمة:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• تأكد من إدخال اسم فريد لكل مخزن</li>
              <li>• العنوان يجب أن يكون دقيقاً لسهولة التوصيل والنقل</li>
              <li>• رقم الهاتف يجب أن يكون مصري ويبدأ بـ +20</li>
              <li>• يمكنك تعيين مدير مسؤول لكل مخزن</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddWarehouse;