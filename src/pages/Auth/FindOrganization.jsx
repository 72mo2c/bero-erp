// ======================================
// Find Organization - البحث عن المؤسسة بالبريد الإلكتروني
// ======================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrganizations } from '../../services/organizationService';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';

const FindOrganization = () => {
  const [email, setEmail] = useState('');
  const [foundOrgs, setFoundOrgs] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    
    // البحث عن المؤسسة المرتبطة بالبريد الإلكتروني
    const organizations = getAllOrganizations();
    const matchingOrgs = organizations.filter(org => 
      org.adminEmail?.toLowerCase() === email.toLowerCase().trim()
    );
    
    setFoundOrgs(matchingOrgs);
    setSearched(true);
    setLoading(false);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // إعادة تعيين النتائج عند تغيير البريد
    if (searched) {
      setSearched(false);
      setFoundOrgs([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl shadow-lg mb-4" style={{ backgroundColor: '#1e3a8a' }}>
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bero System</h1>
          <p className="text-gray-600">البحث عن مؤسستك</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-center mb-6" style={{ color: '#1e3a8a' }}>
            ادخل بريدك الإلكتروني
          </h2>

          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="أدخل بريدك الإلكتروني"
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                يجب أن يكون البريد نفسه المستخدم عند تسجيل المؤسسة
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full text-white py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: '#1e3a8a',
                opacity: (loading || !email.trim()) ? 0.7 : 1
              }}
            >
              {loading ? 'جاري البحث...' : 'البحث عن المؤسسة'}
            </Button>
          </form>

          {/* Search Results */}
          {searched && (
            <div className="mt-6">
              {foundOrgs.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">المؤسسات المرتبطة:</h3>
                  {foundOrgs.map((org) => (
                    <div key={org.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{org.name}</h4>
                          <p className="text-sm text-gray-600">
                            المسؤول: {org.adminName} | الخطة: {org.plan}
                          </p>
                          <p className="text-xs text-gray-500">
                            حالة الاشتراك: {org.status === 'active' ? 'نشط' : 'متوقف'}
                          </p>
                        </div>
                        {org.status === 'active' && (
                          <Link
                            to={`/org/${org.id}/login`}
                            className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                            style={{ backgroundColor: '#1e3a8a' }}
                          >
                            دخول
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 19c-2.034 0-3.9.785-5.291 2.09l-.709-.709" />
                    </svg>
                  </div>
                  <p className="text-gray-600">لم يتم العثور على مؤسسة مرتبطة بهذا البريد</p>
                  <p className="text-sm text-gray-500 mt-1">
                    تأكد من صحة البريد الإلكتروني أو تواصل مع مدير النظام
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">لا تعرف بريدك؟</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• تواصل مع مدير النظام أو مسؤول تكنولوجيا المعلومات</li>
              <li>• إذا كنت مدير المؤسسة، ابحث في البريد المرسلة عند التسجيل</li>
              <li>• يمكنك أيضاً التواصل مع الدعم الفني</li>
            </ul>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              العودة لصفحة تسجيل الدخول
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>&copy; 2025 Bero System. جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

export default FindOrganization;