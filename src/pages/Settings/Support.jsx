// ======================================
// Support - خدمة العملاء والدعم الفني
// ======================================

import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaPhone, FaEnvelope, FaWhatsapp, FaGlobe, FaMapMarkerAlt, FaPaperPlane, FaQuestionCircle, FaCheckCircle, FaClock } from 'react-icons/fa';

const STORAGE_KEY = 'bero_support_tickets';

const Support = () => {
  const { showSuccess, showError } = useNotification();
  
  const [tickets, setTickets] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newTicket, setNewTicket] = useState(null);
  const [showFAQ, setShowFAQ] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  // تحميل التذاكر عند بدء التشغيل
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTickets(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.message.trim() || formData.message.length < 10) {
      showError('الرسالة يجب أن تكون 10 أحرف على الأقل');
      return;
    }

    try {
      const ticket = {
        id: Date.now(),
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        ticketNumber: `TKT-${Date.now().toString().slice(-6)}`
      };

      const updatedTickets = [ticket, ...tickets];
      setTickets(updatedTickets);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));
      
      setNewTicket(ticket);
      setShowSuccessModal(true);
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        priority: 'medium'
      });
    } catch (error) {
      showError('حدث خطأ في إرسال الاستفسار');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'قيد المعالجة', color: 'yellow' },
      inProgress: { label: 'جاري المعالجة', color: 'blue' },
      resolved: { label: 'تم الحل', color: 'green' },
      closed: { label: 'مغلق', color: 'gray' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 bg-${badge.color}-100 text-${badge.color}-700 rounded-full text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { label: 'منخفضة', color: 'gray' },
      medium: { label: 'متوسطة', color: 'blue' },
      high: { label: 'عالية', color: 'orange' },
      urgent: { label: 'عاجلة', color: 'red' }
    };
    const badge = badges[priority] || badges.medium;
    return (
      <span className={`px-3 py-1 bg-${badge.color}-100 text-${badge.color}-700 rounded-full text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  const contactInfo = [
    {
      icon: <FaPhone className="text-blue-600" />,
      title: 'رقم الهاتف',
      value: '+964 750 123 4567',
      description: 'متاح طوال الأسبوع 24/7'
    },
    {
      icon: <FaWhatsapp className="text-green-600" />,
      title: 'واتساب',
      value: '+964 750 123 4567',
      description: 'دعم فوري عبر واتساب'
    },
    {
      icon: <FaEnvelope className="text-red-600" />,
      title: 'البريد الإلكتروني',
      value: 'support@berosystem.com',
      description: 'نرد خلال 24 ساعة'
    },
    {
      icon: <FaGlobe className="text-purple-600" />,
      title: 'الموقع الإلكتروني',
      value: 'www.berosystem.com',
      description: 'زر موقعنا للمزيد من المعلومات'
    },
    {
      icon: <FaMapMarkerAlt className="text-orange-600" />,
      title: 'العنوان',
      value: 'بغداد، العراق',
      description: 'مركز خدمة العملاء الرئيسي'
    }
  ];

  const faqs = [
    {
      question: 'كيف يمكنني إضافة منتج جديد؟',
      answer: 'انتقل إلى قسم "المنتجات" من القائمة الجانبية، ثم اضغط على زر "إضافة منتج جديد". املأ جميع البيانات المطلوبة واضغط حفظ.'
    },
    {
      question: 'كيف يمكنني إنشاء فاتورة مبيعات؟',
      answer: 'انتقل إلى قسم "المبيعات" واختر "إنشاء فاتورة مبيعات"، اختر العميل والمنتجات المطلوبة، ثم احفظ الفاتورة.'
    },
    {
      question: 'كيف أقوم بعمل نسخة احتياطية من البيانات؟',
      answer: 'انتقل إلى "الإعدادات" ثم "النسخ الاحتياطي" واضغط على "إنشاء نسخة احتياطية الآن". سيتم تنزيل ملف يحتوي على جميع بياناتك.'
    },
    {
      question: 'كيف يمكنني إضافة مستخدم جديد؟',
      answer: 'من قائمة "الإعدادات" اختر "إدارة المستخدمين"، املأ نموذج إضافة مستخدم جديد بالبيانات المطلوبة وحدد الصلاحيات.'
    },
    {
      question: 'كيف أعرف حركة المخزون؟',
      answer: 'انتقل إلى قسم "التقارير" واختر "تقرير حركة المخزون" لعرض جميع عمليات الدخول والخروج للمنتجات.'
    },
    {
      question: 'هل يمكنني تخصيص الفواتير؟',
      answer: 'نعم، من "الإعدادات" ثم "إعدادات الفواتير" يمكنك تخصيص شعار الشركة، نص التذييل، ونسبة الضريبة.'
    }
  ];

  const priorityOptions = [
    { value: 'low', label: 'منخفضة' },
    { value: 'medium', label: 'متوسطة' },
    { value: 'high', label: 'عالية' },
    { value: 'urgent', label: 'عاجلة' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">خدمة العملاء والدعم الفني</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">إجمالي الاستفسارات</p>
              <p className="text-3xl font-bold">{tickets.length}</p>
            </div>
            <FaPaperPlane className="text-3xl opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">قيد المعالجة</p>
              <p className="text-3xl font-bold">{tickets.filter(t => t.status === 'pending').length}</p>
            </div>
            <FaClock className="text-3xl opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">تم الحل</p>
              <p className="text-3xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</p>
            </div>
            <FaCheckCircle className="text-3xl opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">متوسط وقت الرد</p>
              <p className="text-3xl font-bold">2<span className="text-xl">ساعة</span></p>
            </div>
            <FaClock className="text-3xl opacity-75" />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {contactInfo.map((item, index) => (
          <Card key={index}>
            <div className="text-center">
              <div className="text-4xl mb-4 flex justify-center">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-blue-600 font-medium mb-2">{item.value}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Submit Ticket Form */}
      <Card icon={<FaPaperPlane />} title="إرسال استفسار جديد" className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="الاسم الكامل"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسمك"
              required
            />
            <Input
              label="البريد الإلكتروني"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
            <Input
              label="رقم الهاتف"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+964 XXX XXX XXXX"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <Input
            label="الموضوع"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="موضوع الاستفسار"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="اكتب استفسارك بالتفصيل..."
              required
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Button type="submit" variant="primary">
            <FaPaperPlane className="ml-2" />
            إرسال الاستفسار
          </Button>
        </form>
      </Card>

      {/* FAQ Section */}
      <Card icon={<FaQuestionCircle />} title="الأسئلة الشائعة" className="mb-6">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-start gap-2">
                <span className="text-blue-600">س:</span>
                {faq.question}
              </h4>
              <p className="text-gray-600 mr-6 text-sm leading-relaxed">
                <span className="text-green-600 font-semibold">ج:</span> {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tickets History */}
      {tickets.length > 0 && (
        <Card icon={<FaClock />} title="سجل الاستفسارات">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">رقم التذكرة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الموضوع</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">الأولوية</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">التاريخ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.slice(0, 10).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-blue-600">{ticket.ticketNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                      <div className="text-sm text-gray-500">{ticket.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Developer Info */}
      <Card title="معلومات المطور" className="mt-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">تم التطوير بواسطة MiniMax Agent</h3>
          <p className="text-gray-700 mb-4">
            نظام Bero System لإدارة المخازن الشامل هو حل متكامل لإدارة جميع عمليات المخزن،
            من المشتريات والمبيعات إلى إدارة الخزينة والتقارير المالية.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
              React 18
            </span>
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
              TailwindCSS
            </span>
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
              Context API
            </span>
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
              React Router
            </span>
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
              LocalStorage
            </span>
          </div>
        </div>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && newTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">تم إرسال الاستفسار بنجاح!</h3>
              <p className="text-gray-600 mb-4">
                تم استلام استفسارك وسيتم الرد عليك في أقرب وقت ممكن
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 text-right">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>رقم التذكرة:</strong> <span className="font-mono text-blue-600">{newTicket.ticketNumber}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>الموضوع:</strong> {newTicket.subject}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>الأولوية:</strong> {getPriorityBadge(newTicket.priority)}
                </p>
              </div>
            </div>

            <Button 
              variant="primary" 
              fullWidth
              onClick={() => {
                setShowSuccessModal(false);
                setNewTicket(null);
              }}
            >
              حسناً
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
