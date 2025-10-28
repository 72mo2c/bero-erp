// ======================================
// Add Customer - إضافة عميل جديد
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import { Select } from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaUserPlus, FaSave, FaCheckCircle, FaPlus, FaList } from 'react-icons/fa';

const AddCustomer = () => {
  const { addCustomer } = useData();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastAddedCustomer, setLastAddedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    area: '',
    phone1: '',
    phone2: '',
    agentType: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      area: '',
      phone1: '',
      phone2: '',
      agentType: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const customerData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const newCustomer = addCustomer(customerData);
      setLastAddedCustomer(newCustomer);
      setShowSuccessModal(true);
      resetForm();
    } catch (error) {
      showError('حدث خطأ في إضافة العميل');
    }
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    setLastAddedCustomer(null);
  };

  const handleGoToList = () => {
    navigate('/customers/manage');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">إضافة عميل جديد</h1>

      <Card icon={<FaUserPlus />}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="اسم العميل"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسم العميل"
              required
            />

            <Input
              label="العنوان"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="أدخل العنوان"
              required
            />
            <Select
              label="نوع الوكيل / المندوب"
              name="agentType"
              value={formData.agentType}
              onChange={handleChange}
              options={[
                { value: '', label: 'اختر نوع الوكيل / المندوب' },
                { value: 'general', label: 'عام' },
                { value: 'fatora', label: 'فاتورة' },
                { value: 'kartona', label: 'كرتونة' },
              ]}
              required
            />
            <Input
              label="النطاق"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="مثال: مصر ,القاهرة..."
            />

            <Input
              label="رقم الهاتف 1"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              placeholder="+20 XXX XXX XXXX"
              required
            />

            <Input
              label="رقم الهاتف 2 (اختياري)"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              placeholder="+20 XXX XXX XXXX"
            />

          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="success" icon={<FaSave />}>
              حفظ العميل
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={resetForm}
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </Card>

      {/* نافذة النجاح */}
      {showSuccessModal && lastAddedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            {/* رمز النجاح */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 rounded-full p-4">
                <FaCheckCircle className="text-5xl text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              تمت الإضافة بنجاح! ✓
            </h2>

            <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
              <p className="text-gray-700 text-center mb-2">
                تم إضافة العميل <span className="font-bold">"{lastAddedCustomer.name}"</span> بنجاح
              </p>
            </div>

            {/* تفاصيل العميل */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">تفاصيل العميل المضاف:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">الاسم: </span>
                  <span className="font-semibold">{lastAddedCustomer.name}</span>
                </div>
                {lastAddedCustomer.address && (
                  <div>
                    <span className="text-gray-600">العنوان: </span>
                    <span className="font-semibold">{lastAddedCustomer.address}</span>
                  </div>
                )}
                {lastAddedCustomer.area && (
                  <div>
                    <span className="text-gray-600">النطاق: </span>
                    <span className="font-semibold">{lastAddedCustomer.area}</span>
                  </div>
                )}
                {lastAddedCustomer.phone1 && (
                  <div>
                    <span className="text-gray-600">الهاتف: </span>
                    <span className="font-semibold">{lastAddedCustomer.phone1}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-center mb-4">ماذا تريد أن تفعل الآن؟</p>

            {/* الأزرار */}
            <div className="flex gap-3">
              <button
                onClick={handleAddAnother}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus />
                إضافة عميل آخر
              </button>
              <button
                onClick={handleGoToList}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaList />
                عرض القائمة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCustomer;
