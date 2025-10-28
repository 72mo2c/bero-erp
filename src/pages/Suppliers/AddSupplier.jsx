// ======================================
// Add Supplier - إضافة مورد جديد
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaTruck, FaSave, FaCheckCircle, FaPlus, FaList } from 'react-icons/fa';

const AddSupplier = () => {
  const { addSupplier } = useData();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastAddedSupplier, setLastAddedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone1: '',
    phone2: '',
    email: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone1: '',
      phone2: '',
      email: '',
      notes: ''
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
      const supplierData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const newSupplier = addSupplier(supplierData);
      setLastAddedSupplier(newSupplier);
      setShowSuccessModal(true);
      resetForm();
    } catch (error) {
      showError('حدث خطأ في إضافة المورد');
    }
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    setLastAddedSupplier(null);
  };

  const handleGoToList = () => {
    navigate('/suppliers/manage');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">إضافة مورد جديد</h1>

      <Card icon={<FaTruck />}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="اسم المورد / الشركة"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسم المورد"
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

          <div>
            <label className="label">ملاحظات (اختياري)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="input-field"
              placeholder="أدخل ملاحظات..."
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="success" icon={<FaSave />}>
              حفظ المورد
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
      {showSuccessModal && lastAddedSupplier && (
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
                تم إضافة المورد <span className="font-bold">"{lastAddedSupplier.name}"</span> بنجاح
              </p>
            </div>

            {/* تفاصيل المورد */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">تفاصيل المورد المضاف:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">الاسم: </span>
                  <span className="font-semibold">{lastAddedSupplier.name}</span>
                </div>
                {lastAddedSupplier.address && (
                  <div>
                    <span className="text-gray-600">العنوان: </span>
                    <span className="font-semibold">{lastAddedSupplier.address}</span>
                  </div>
                )}
                {lastAddedSupplier.phone1 && (
                  <div>
                    <span className="text-gray-600">الهاتف: </span>
                    <span className="font-semibold">{lastAddedSupplier.phone1}</span>
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
                إضافة مورد آخر
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

export default AddSupplier;
