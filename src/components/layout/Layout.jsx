// import { useState } from "react";
// import Sidebar from "./Sidebar";
// import Navbar from "./Navbar";

// const Layout = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
//       {/* Sidebar */}
//       <Sidebar
//         isOpen={sidebarOpen}
//         onToggle={() => setSidebarOpen(false)}
//       />

//       {/* Main wrapper */}
//       <div className="lg:pl-64">
//         {/* Navbar (fixed height) */}
//         <Navbar onMenuClick={() => setSidebarOpen(true)} />

//         {/* Page Content */}
//         <main className="pt-16 p-4 lg:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;
import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Main Content */}
      <main className="ml-0 lg:ml-64 pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;
