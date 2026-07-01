import { useState } from 'react';
import { 
  trackPageView, 
  trackEvent, 
  trackLogin, 
  trackSignup, 
  trackButtonClick,
  trackBillCreated,
  trackProductAdded,
  trackSearch,
  trackError
} from '../../utils/analytics';

const AnalyticsTest = () => {
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testPageView = () => {
    trackPageView('/test-page');
    addLog('✅ Page view tracked: /test-page');
  };

  const testLogin = () => {
    trackLogin('email');
    addLog('✅ Login event tracked (email)');
  };

  const testSignup = () => {
    trackSignup('google');
    addLog('✅ Signup event tracked (google)');
  };

  const testButtonClick = () => {
    trackButtonClick('Test Button');
    addLog('✅ Button click tracked');
  };

  const testBillCreated = () => {
    trackBillCreated(1500);
    addLog('✅ Bill created tracked (₹1500)');
  };

  const testProductAdded = () => {
    trackProductAdded('Test Product');
    addLog('✅ Product added tracked');
  };

  const testSearch = () => {
    trackSearch('test search query');
    addLog('✅ Search tracked');
  };

  const testError = () => {
    trackError('Test error message');
    addLog('✅ Error tracked');
  };

  const testCustomEvent = () => {
    trackEvent('Test Category', 'Test Action', 'Test Label', 100);
    addLog('✅ Custom event tracked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Google Analytics Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Test all analytics events and check browser console for debug logs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={testPageView}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              📄 Test Page View
            </button>

            <button
              onClick={testLogin}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              🔐 Test Login Event
            </button>

            <button
              onClick={testSignup}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              ✍️ Test Signup Event
            </button>

            <button
              onClick={testButtonClick}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              🖱️ Test Button Click
            </button>

            <button
              onClick={testBillCreated}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              💰 Test Bill Created
            </button>

            <button
              onClick={testProductAdded}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              📦 Test Product Added
            </button>

            <button
              onClick={testSearch}
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              🔍 Test Search
            </button>

            <button
              onClick={testError}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              ❌ Test Error
            </button>

            <button
              onClick={testCustomEvent}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition md:col-span-2"
            >
              ⚡ Test Custom Event
            </button>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              📝 Event Log
            </h2>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No events tracked yet. Click buttons above to test.
                </p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-white dark:bg-gray-800 p-2 rounded"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 How to verify:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>Open browser console (F12)</li>
              <li>Click any button above</li>
              <li>Check console for GA debug logs</li>
              <li>Go to Google Analytics → Reports → Realtime</li>
              <li>You should see events appearing in real-time</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTest;
