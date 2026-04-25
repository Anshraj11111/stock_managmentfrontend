import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../utils/analytics';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Instant scroll, no animation
    });

    // Track page view in Google Analytics
    trackPageView(pathname);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
