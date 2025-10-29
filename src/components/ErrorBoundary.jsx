// ======================================
// Error Boundary - معالجة الأخطاء
// ======================================

import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // تحديث الحالة لإظهار واجهة الخطأ
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // تسجيل الخطأ
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // يمكن إرسال الأخطاء إلى خدمة تسجيل الأخطاء هنا
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, componentName = 'المكون' } = this.props;
      
      if (Fallback) {
        return <Fallback error={this.state.error} errorInfo={this.state.errorInfo} />;
      }

      // واجهة الخطأ الافتراضية
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              عذراً، حدث خطأ غير متوقع
            </h3>
            
            <p className="text-sm text-gray-600 text-center mb-4">
              حدث خطأ في {componentName}. يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.
            </p>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                إعادة تحميل الصفحة
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                المحاولة مرة أخرى
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-red-600 overflow-auto max-h-32">
                  <div className="font-medium mb-1">{this.state.error.toString()}</div>
                  <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher Order Component للوصول السهل
export const withErrorBoundary = (Component, componentName) => {
  return (props) => (
    <ErrorBoundary componentName={componentName}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Hook للوصول السهل
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    console.error('خطأ غير معالج:', error, errorInfo);
    // يمكن إرسال الخطأ لخدمة التسجيل هنا
  };
};

export default ErrorBoundary;
