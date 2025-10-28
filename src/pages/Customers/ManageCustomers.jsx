// ======================================
// Manage Customers - إدارة العملاء
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Common/Card';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import { Select } from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaUsers, FaExclamationTriangle, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const ManageCustomers = () => {
  const { customers, updateCustomer, deleteCustomer } = useData();
  const { showSuccess, showError } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();

  // فحص الصلاحيات
  const canEditCustomer = hasPermission('edit_customer');
  const canDeleteCustomer = hasPermission('delete_customer');
  const canManageCustomers = hasPermission('manage_customers');
  
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    area: '',
    phone1: '',
    phone2: '',
    agentType: '',
  });

  const handleEdit = (customer) => {
    if (!canEditCustomer) {
      showError('ليس لديك صلاحية لتعديل بيانات العملاء');
      return;
    }
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      address: customer.address || '',
      area: customer.area || '',
      phone1: customer.phone1 || '',
      phone2: customer.phone2 || '',
      agentType: customer.agentType || '',
    });
    setEditModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!canEditCustomer) {
      showError('ليس لديك صلاحية لتعديل بيانات العملاء');
      return;
    }
    
    try {
      updateCustomer(selectedCustomer.id, formData);
      showSuccess('تم تحديث بيانات العميل بنجاح');
      setEditModal(false);
      setSelectedCustomer(null);
    } catch (error) {
      showError('حدث خطأ في تحديث العميل');
    }
  };

  const handleDeleteClick = (customer) => {
    if (!canDeleteCustomer) {
      showError('ليس لديك صلاحية لحذف العملاء');
      return;
    }
    setCustomerToDelete(customer);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!canDeleteCustomer) {
      showError('ليس لديك صلاحية لحذف العملاء');
      setDeleteModal(false);
      return;
    }
    
    try {
      deleteCustomer(customerToDelete.id);
      showSuccess(`تم حذف العميل "${customerToDelete.name}" بنجاح`);
      setDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
      showError('حدث خطأ في حذف العميل');
      setDeleteModal(false);
    }
  };

  // فحص صلاحية الوصول
  if (!canManageCustomers) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <FaExclamationTriangle className="text-red-600 text-2xl" />
          <div>
            <h3 className="text-red-800 font-bold text-lg">وصول غير مصرح</h3>
            <p className="text-red-700">ليس لديك صلاحية لإدارة العملاء</p>
            <p className="text-red-600 text-sm mt-1">يرجى التواصل مع المدير للحصول على الصلاحية المطلوبة</p>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    { header: 'الاسم', accessor: 'name' },
    { header: 'العنوان', accessor: 'address' },
    { header: 'النطاق', accessor: 'area' },
    { header: 'الهاتف 1', accessor: 'phone1' },
    { header: 'الهاتف 2', accessor: 'phone2' },
    { header: 'المندوب', accessor: 'agentType' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة العملاء</h1>

      <Card icon={<FaUsers />}>
        <Table
          columns={columns}
          data={customers}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </Card>

      {/* نافذة التعديل */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="تعديل بيانات العميل"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModal(false)}>إلغاء</Button>
            <Button variant="success" onClick={handleUpdate}>حفظ التغييرات</Button>
          </>
        }
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input label="الاسم" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Select 
            label="نوع الوكيل / المندوب"
            name="agentType"
            value={formData.agentType}
            onChange={(e) => setFormData({ ...formData, agentType: e.target.value })}
            options={[
              { value: '', label: 'اختر نوع الوكيل / المندوب' },
              { value: 'general', label: 'عام' },
              { value: 'fatora', label: 'فاتورة' },
              { value: 'kartona', label: 'كرتونة' },
            ]}
          />
          <Input label="العنوان" name="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <Input label="النطاق" name="area" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
          <Input label="الهاتف 1" name="phone1" value={formData.phone1} onChange={(e) => setFormData({ ...formData, phone1: e.target.value })} />
          <Input label="الهاتف 2" name="phone2" value={formData.phone2} onChange={(e) => setFormData({ ...formData, phone2: e.target.value })} />
          
        </form>
      </Modal>

      {/* نافذة تأكيد الحذف */}
      {deleteModal && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            {/* رمز التحذير */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-4">
                <FaExclamationTriangle className="text-4xl text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              تأكيد حذف العميل
            </h2>

            <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
              <p className="text-gray-700 text-center mb-2">
                هل أنت متأكد من حذف العميل <span className="font-bold">"{customerToDelete.name}"</span>؟
              </p>
              <p className="text-sm text-red-600 text-center font-semibold">
                ⚠️ لا يمكن التراجع عن هذا الإجراء
              </p>
            </div>

            {/* تفاصيل العميل */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">تفاصيل العميل:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">الاسم: </span>
                  <span className="font-semibold">{customerToDelete.name}</span>
                </div>
                {customerToDelete.agentType && (
                  <div>
                    <span className="text-gray-600">الوكيل / المندوب: </span>
                    <span className="font-semibold">{customerToDelete.agentType}</span>
                  </div>
                )}
                {customerToDelete.address && (
                  <div>
                    <span className="text-gray-600">العنوان: </span>
                    <span className="font-semibold">{customerToDelete.address}</span>
                  </div>
                )}
                {customerToDelete.area && (
                  <div>
                    <span className="text-gray-600">النطاق: </span>
                    <span className="font-semibold">{customerToDelete.area}</span>
                  </div>
                )}
                {customerToDelete.phone1 && (
                  <div>
                    <span className="text-gray-600">الهاتف: </span>
                    <span className="font-semibold">{customerToDelete.phone1}</span>
                  </div>
                )}
                
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                نعم، احذف العميل
              </button>
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setCustomerToDelete(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCustomers;
