// ======================================
// Add User - إضافة و إدارة المستخدمين
// ======================================

import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { hashPassword } from '../../utils/security';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Button from '../../components/Common/Button';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaUserShield, FaCheckCircle, FaLock } from 'react-icons/fa';

const STORAGE_KEY = 'bero_system_users';

const AddUser = () => {
  const { showSuccess, showError, showWarning } = useNotification();
  const { isAdmin } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  });
  const [editFormData, setEditFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  });

  // تحميل المستخدمين عند بدء التشغيل
  useEffect(() => {
    loadUsers();
  }, []);

  // فحص المدير فقط
  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <FaLock className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">مدير فقط</h3>
          <p className="text-gray-600 mb-4">
            إدارة المستخدمين متاحة للمدير العام فقط.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            دورك الحالي: غير مدير - مطلوب: admin
          </p>
          <button
            onClick={() => window.location.href = '#/dashboard'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  const loadUsers = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUsers(JSON.parse(saved));
      } else {
        // إضافة مستخدم افتراضي
        const defaultUsers = [
          {
            id: 1,
            username: 'admin',
            password: hashPassword('admin123'),
            name: 'المدير العام',
            email: 'admin@berosystem.com',
            phone: '+20 XXX XXX XXXX',
            role: 'admin',
            status: 'active',
            createdAt: new Date().toISOString()
          }
        ];
        setUsers(defaultUsers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showError('كلمتا المرور غير متطابقتين');
      return;
    }

    if (formData.password.length < 6) {
      showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    // التحقق من عدم تكرار اسم المستخدم
    if (users.some(u => u.username === formData.username)) {
      showError('اسم المستخدم موجود بالفعل');
      return;
    }

    try {
      const user = {
        id: Date.now(),
        username: formData.username,
        password: hashPassword(formData.password), // تشفير كلمة المرور
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users, user];
      setUsers(updatedUsers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      
      setNewUser(user);
      setShowSuccessModal(true);
      
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        phone: '',
        role: 'user',
        status: 'active'
      });
    } catch (error) {
      showError('حدث خطأ في إضافة المستخدم');
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    try {
      const updatedUsers = users.filter(u => u.id !== selectedUser.id);
      setUsers(updatedUsers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      setShowDeleteModal(false);
      setSelectedUser(null);
      showSuccess('تم حذف المستخدم بنجاح');
    } catch (error) {
      showError('حدث خطأ أثناء حذف المستخدم');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    });
    setShowEditModal(true);
  };

  const confirmEdit = () => {
    try {
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...editFormData, updatedAt: new Date().toISOString() }
          : u
      );
      setUsers(updatedUsers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      setShowEditModal(false);
      setSelectedUser(null);
      showSuccess('تم تعديل بيانات المستخدم بنجاح');
    } catch (error) {
      showError('حدث خطأ أثناء تعديل المستخدم');
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'مدير' },
    { value: 'manager', label: 'مدير مخزن' },
    { value: 'user', label: 'مستخدم' },
    { value: 'viewer', label: 'مشاهد فقط' }
  ];

  const statusOptions = [
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' }
  ];

  const getRoleLabel = (role) => {
    const option = roleOptions.find(r => r.value === role);
    return option ? option.label : role;
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">نشط</span>
      : <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">غير نشط</span>;
  };

  // تصفية المستخدمين
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة المستخدمين</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">إجمالي المستخدمين</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">المستخدمون النشطون</p>
          <p className="text-3xl font-bold">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">المديرون</p>
          <p className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">المستخدمون العاديون</p>
          <p className="text-3xl font-bold">{users.filter(u => u.role === 'user').length}</p>
        </div>
      </div>

      {/* Add User Form */}
      <Card icon={<FaUserPlus />} title="إضافة مستخدم جديد" className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="اسم المستخدم"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="أدخل اسم المستخدم"
              required
            />
            <Input
              label="الاسم الكامل"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="الاسم الكامل"
              required
            />
            <Input
              label="البريد الإلكتروني"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
            <Input
              label="رقم الهاتف"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+964 XXX XXX XXXX"
            />
            <Input
              label="كلمة المرور"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور"
              required
            />
            <Input
              label="تأكيد كلمة المرور"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="أعد إدخال كلمة المرور"
              required
            />
            <Select
              label="الصلاحية"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
              required
            />
            <Select
              label="الحالة"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="success">
              <FaUserPlus className="ml-2" />
              إضافة المستخدم
            </Button>
          </div>
        </form>
      </Card>

      {/* Users List */}
      <Card icon={<FaUserShield />} title="قائمة المستخدمين">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="البحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <Select
            name="filterRole"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            options={[
              { value: 'all', label: 'جميع الصلاحيات' },
              ...roleOptions
            ]}
          />
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الهاتف</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">الصلاحية</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">الحالة</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    لا توجد بيانات متاحة
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="تعديل"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            عرض {filteredUsers.length} من أصل {users.length} مستخدم
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaTrash className="text-3xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">تأكيد حذف المستخدم</h3>
              <p className="text-gray-600 mb-4">
                هل أنت متأكد من حذف المستخدم التالي؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 text-right">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>الاسم:</strong> {selectedUser.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>اسم المستخدم:</strong> {selectedUser.username}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>الصلاحية:</strong> {getRoleLabel(selectedUser.role)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                إلغاء
              </Button>
              <Button 
                variant="danger" 
                fullWidth
                onClick={confirmDelete}
              >
                <FaTrash className="ml-2" />
                حذف المستخدم
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && newUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">تمت الإضافة بنجاح!</h3>
              <p className="text-gray-600 mb-4">
                تم إضافة المستخدم بنجاح إلى النظام
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 text-right">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>الاسم:</strong> {newUser.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>اسم المستخدم:</strong> {newUser.username}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>البريد:</strong> {newUser.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>الصلاحية:</strong> {getRoleLabel(newUser.role)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="primary" 
                fullWidth
                onClick={() => {
                  setShowSuccessModal(false);
                  setNewUser(null);
                }}
              >
                حسناً
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaEdit className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">تعديل بيانات المستخدم</h3>
                  <p className="text-sm text-gray-600">تعديل معلومات {selectedUser.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="اسم المستخدم"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditChange}
                  disabled
                />
                <Input
                  label="الاسم الكامل"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                />
                <Input
                  label="البريد الإلكتروني"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                />
                <Input
                  label="رقم الهاتف"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                />
                <Select
                  label="الصلاحية"
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditChange}
                  options={roleOptions}
                  required
                />
                <Select
                  label="الحالة"
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditChange}
                  options={statusOptions}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
              >
                إلغاء
              </Button>
              <Button 
                variant="success" 
                fullWidth
                onClick={confirmEdit}
              >
                <FaCheckCircle className="ml-2" />
                حفظ التعديلات
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;