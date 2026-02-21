import { Mail, Phone, MapPin, Heart, Zap } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-white to-gray-50 dark:from-secondary-900 dark:to-secondary-950 border-t border-secondary-200 dark:border-secondary-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                StockSaaS
              </h3>
            </div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4 leading-relaxed">
              Complete stock management solution for your business. Manage inventory, billing, and invoices with ease.
            </p>
            <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-500">
              <span>Powered by</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">A5X</span>
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Email Us
            </h3>
            <div className="space-y-3">
              <a 
                href="mailto:support@stocksaas.com" 
                className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
              >
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <div>
                  <div className="font-medium group-hover:underline">anshrajbaghel30@gmail.com</div>
                  <div className="text-xs text-secondary-500">General Support</div>
                </div>
              </a>
              <a 
                href="mailto:sales@stocksaas.com" 
                className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
              >
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <div>
                  <div className="font-medium group-hover:underline"> a5xrobotics@gmail.com</div>
                  <div className="text-xs text-secondary-500">Sales & Inquiries</div>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Call Us
            </h3>
            <div className="space-y-3">
              <a 
                href="tel:+918269858259" 
                className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
              >
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <div>
                  <div className="font-medium group-hover:underline">+91 8269858259</div>
                  <div className="text-xs text-secondary-500">Support Line</div>
                </div>
              </a>
              <a 
                href="tel:+91 8839076135" 
                className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
              >
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <div>
                  <div className="font-medium group-hover:underline">+91 8839076135</div>
                  <div className="text-xs text-secondary-500">Sales Line</div>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links & Location */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Quick Links
            </h3>
            <div className="space-y-2 mb-6">
              <a 
                href="mailto:support@stocksaas.com?subject=Help Request" 
                className="block text-sm text-secondary-600 dark:text-secondary-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hover:translate-x-1 transform duration-200"
              >
                → Help Center
              </a>
              <a 
                href="mailto:support@stocksaas.com?subject=Feature Request" 
                className="block text-sm text-secondary-600 dark:text-secondary-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hover:translate-x-1 transform duration-200"
              >
                → Feature Request
              </a>
              <a 
                href="mailto:support@stocksaas.com?subject=Bug Report" 
                className="block text-sm text-secondary-600 dark:text-secondary-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hover:translate-x-1 transform duration-200"
              >
                → Report a Bug
              </a>
            </div>
            
            {/* Location */}
            <div className="flex items-start gap-2 text-sm text-secondary-600 dark:text-secondary-400">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Jabalpur, India</div>
                <div className="text-xs text-secondary-500">Serving Nationwide</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
              <span>© {currentYear} StockSaaS. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Powered by <span className="font-bold text-indigo-600 dark:text-indigo-400">A5X</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-sm text-secondary-600 dark:text-secondary-400 flex items-center gap-1">
                Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> in India
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
