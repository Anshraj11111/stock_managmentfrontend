import ReactGA from 'react-ga4';

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_ID;
  
  if (measurementId) {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        debug_mode: isDevelopment, // Enable debug mode in development
        siteSpeedSampleRate: 100,
      },
      gtagOptions: {
        debug_mode: isDevelopment,
      },
    });
    
    console.log('✅ Google Analytics initialized');
    console.log('📊 Measurement ID:', measurementId);
    console.log('🔧 Debug Mode:', isDevelopment);
    
    // Send initial page view
    ReactGA.send({ 
      hitType: 'pageview', 
      page: window.location.pathname + window.location.search 
    });
    
    console.log('📄 Initial page view sent:', window.location.pathname);
  } else {
    console.warn('⚠️ Google Analytics ID not found in environment variables');
  }
};

// Track page views
export const trackPageView = (path) => {
  if (isDevelopment) {
    console.log('📄 GA Page View:', path);
  }
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track custom events
export const trackEvent = (category, action, label = '', value = 0) => {
  if (isDevelopment) {
    console.log('📊 GA Event:', { category, action, label, value });
  }
  
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// Track user login
export const trackLogin = (method = 'email') => {
  console.log('🔐 Tracking login:', method);
  
  // GA4 recommended event
  ReactGA.event('login', {
    method: method,
  });
  
  // Also track as custom event for backwards compatibility
  trackEvent('User', 'Login', method);
};

// Track user signup
export const trackSignup = (method = 'email') => {
  console.log('✍️ Tracking signup:', method);
  
  // GA4 recommended event
  ReactGA.event('sign_up', {
    method: method,
  });
  
  // Also track as custom event for backwards compatibility
  trackEvent('User', 'Signup', method);
};

// Track button clicks
export const trackButtonClick = (buttonName) => {
  if (isDevelopment) {
    console.log('🖱️ Button clicked:', buttonName);
  }
  trackEvent('Button', 'Click', buttonName);
};

// Track form submissions
export const trackFormSubmit = (formName) => {
  console.log('📝 Form submitted:', formName);
  trackEvent('Form', 'Submit', formName);
};

// Track errors
export const trackError = (errorMessage) => {
  console.error('❌ Error tracked:', errorMessage);
  
  // GA4 recommended event
  ReactGA.event('exception', {
    description: errorMessage,
    fatal: false,
  });
  
  trackEvent('Error', 'Exception', errorMessage);
};

// Track Google OAuth events
export const trackGoogleAuth = (action) => {
  console.log('🔐 Google OAuth:', action);
  trackEvent('Google OAuth', action);
};

// Track bill creation
export const trackBillCreated = (amount) => {
  console.log('💰 Bill created:', amount);
  
  ReactGA.event('purchase', {
    currency: 'INR',
    value: amount,
    transaction_id: `BILL-${Date.now()}`,
  });
  
  trackEvent('Bill', 'Created', 'Bill Created', amount);
};

// Track product added
export const trackProductAdded = (productName) => {
  console.log('📦 Product added:', productName);
  trackEvent('Product', 'Added', productName);
};

// Track search
export const trackSearch = (searchTerm) => {
  if (isDevelopment) {
    console.log('🔍 Search:', searchTerm);
  }
  
  ReactGA.event('search', {
    search_term: searchTerm,
  });
};
