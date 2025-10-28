// ======================================
// Manage Suppliers - إدارة الموردين
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
import Button from '../../components/Common/Button';
import { FaList, FaExclamationTriangle, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const ManageSuppliers = () => {
  const { suppliers, updateSupplier, deleteSupplier } = useData();
  const { showSuccess, showError } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();

  // فحص الصلاحيات
  const canEditSupplier = hasPermission('edit_supplier');
  const canDeleteSupplier = hasPermission('delete_supplier');
  const canManageSuppliers = hasPermission('manage_suppliers');
  
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone1: '',
    phone2: '',
    email: '',
    notes: ''
  });

  const handleEdit = (supplier) => {
    if (!canEditSupplier) {
      showError('ليس لديك صلاحية لتعديل بيانات الموردين');
      return;
    }
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      address: supplier.address || '',
      phone1: supplier.phone1 || '',
      phone2: supplier.phone2 || '',
      email: supplier.email || '',
      notes: supplier.notes || ''
    });
    setEditModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!canEditSupplier) {
      showError('ليس لديك صلاحية لتعديل بيانات الموردين');
      return;
    }
    
    try {
      updateSupplier(selectedSupplier.id, formData);
      showSuccess('تم تحديث بيانات المورد بنجاح');
      setEditModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      showError('حدث خطأ في تحديث المورد');
    }
  };

  const handleDeleteClick = (supplier) => {
    if (!canDeleteSupplier) {
      showError('ليس لديك صلاحية لحذف الموردين');
      return;
    }
    setSupplierToDelete(supplier);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!canDeleteSupplier) {
      showError('ليس لديك صلاحية لحذف الموردين');
      setDeleteModal(false);
      return;
    }
    
    try {
      deleteSupplier(supplierToDelete.id);
      showSuccess(`تم حذف المورد "${supplierToDelete.name}" بنجاح`);
      setDeleteModal(false);
      setSupplierToDelete(null);
    } catch (error) {
      showError('حدث خطأ في حذف المورد');
      setDeleteModal(false);
    }
  };

  // فحص صلاحية الوصول
  if (!canManageSuppliers) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <FaExclamationTriangle className="text-red-600 text-2xl" />
          <div>
            <h3 className="text-red-800 font-bold text-lg">وصول غير مصرح</h3>
            <p className="text-red-700">ليس لديك صلاحية لإدارة الموردين</p>
            <p className="text-red-600 text-sm mt-1">يرجى التواصل مع المدير للحصول على الصلاحية المطلوبة</p>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    { header: 'الاسم', accessor: 'name' },
    { header: 'العنوان', accessor: 'address' },
    { header: 'الهاتف 1', accessor: 'phone1' },
    { header: 'الهاتف 2', accessor: 'phone2' },
    { header: 'البريد', accessor: 'email' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة الموردين</h1>

      <Card icon={<FaList />}>
        <Table
          columns={columns}
          data={suppliers}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </Card>

      {/* نافذة التعديل */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="تعديل بيانات المورد"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModal(false)}>إلغاء</Button>
            <Button variant="success" onClick={handleUpdate}>حفظ التغييرات</Button>
          </>
        }
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input label="الاسم" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="العنوان" name="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <Input label="الهاتف 1" name="phone1" value={formData.phone1} onChange={(e) => setFormData({ ...formData, phone1: e.target.value })} />
          <Input label="الهاتف 2" name="phone2" value={formData.phone2} onChange={(e) => setFormData({ ...formData, phone2: e.target.value })} />
          <Input label="البريد" name="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </form>
      </Modal>

      {/* نافذة تأكيد الحذف */}
      {deleteModal && supplierToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            {/* رمز التحذير */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-4">
                <FaExclamationTriangle className="text-4xl text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              تأكيد حذف المورد
            </h2>

            <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
              <p className="text-gray-700 text-center mb-2">
                هل أنت متأكد من حذف المورد <span className="font-bold">"{supplierToDelete.name}"</span>؟
              </p>
              <p className="text-sm text-red-600 text-center font-semibold">
                ⚠️ لا يمكن التراجع عن هذا الإجراء
              </p>
            </div>

            {/* تفاصيل المورد */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">تفاصيل المورد:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">الاسم: </span>
                  <span className="font-semibold">{supplierToDelete.name}</span>
                </div>
                {supplierToDelete.address && (
                  <div>
                    <span className="text-gray-600">العنوان: </span>
                    <span className="font-semibold">{supplierToDelete.address}</span>
                  </div>
                )}
                {supplierToDelete.phone1 && (
                  <div>
                    <span className="text-gray-600">الهاتف: </span>
                    <span className="font-semibold">{supplierToDelete.phone1}</span>
                  </div>
                )}
                {supplierToDelete.email && (
                  <div>
                    <span className="text-gray-600">البريد: </span>
                    <span className="font-semibold">{supplierToDelete.email}</span>
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
                نعم، احذف المورد
              </button>
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setSupplierToDelete(null);
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

export default ManageSuppliers;
