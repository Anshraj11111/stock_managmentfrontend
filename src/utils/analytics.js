import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_ID;
  
  if (measurementId) {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        siteSpeedSampleRate: 100,
      },
    });
    console.log('✅ Google Analytics initialized:', measurementId);
  } else {
    console.warn('⚠️ Google Analytics ID not found in environment variables');
  }
};

// Track page views
export const trackPageView = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track custom events
export const trackEvent = (category, action, label = '', value = 0) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// Track user login
export const trackLogin = (method = 'email') => {
  trackEvent('User', 'Login', method);
};

// Track user signup
export const trackSignup = (method = 'email') => {
  trackEvent('User', 'Signup', method);
};

// Track button clicks
export const trackButtonClick = (buttonName) => {
  trackEvent('Button', 'Click', buttonName);
};

// Track form submissions
export const trackFormSubmit = (formName) => {
  trackEvent('Form', 'Submit', formName);
};

// Track errors
export const trackError = (errorMessage) => {
  trackEvent('Error', 'Exception', errorMessage);
};

// Track Google OAuth events
export const trackGoogleAuth = (action) => {
  trackEvent('Google OAuth', action);
};
