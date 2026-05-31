// import { useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import Navbar from './Navbar';
// import Footer from '../common/Footer';
// import VoiceButton from '../common/Voicebutton';

// const Layout = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const location = useLocation();
  
//   // Show footer only on Dashboard page
//   const showFooter = location.pathname === '/dashboard';

//   return (
//     <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex">
//       {/* Sidebar */}
//       <Sidebar
//         isOpen={sidebarOpen}
//         onToggle={() => setSidebarOpen(!sidebarOpen)}
//       />

//       {/* Content area */}
//       <div className="flex-1 flex flex-col min-h-screen">
//         <Navbar onMenuClick={() => setSidebarOpen(true)} />

//         {/* Main content wrapper */}
//         <div className="pt-16 lg:ml-64 flex-1 flex flex-col">
//           {/* Page content */}
//           <main className="flex-1 bg-secondary-50 dark:bg-secondary-950">
//             <div className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-16rem)]">
//               {children}
//             </div>
//           </main>
          
//           {/* Footer - only on Dashboard page */}
//           {showFooter && <Footer />}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Layout;



import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from '../common/Footer';
// import VoiceButton from '../common/VoiceButton'; // Voice assistant disabled

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const showFooter = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Wrapper */}
        <div className="pt-16 lg:ml-64 flex-1 flex flex-col">

          {/* Main Content */}
          <main className="flex-1 bg-secondary-50 dark:bg-secondary-950">
            <div className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-16rem)]">
              {children}
            </div>
          </main>

          {/* Footer only Dashboard */}
          {showFooter && <Footer />}

        </div>

      </div>

      {/* 🔥 Voice Button Here - Disabled */}
      {/* <VoiceButton /> */}

    </div>
  );
};

export default Layout;