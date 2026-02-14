// import { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2, Users, UserCheck, UserX, Mail, Shield, Search } from 'lucide-react';
// import { staffService } from '../../services/staffService';
// import Input from '../../components/common/Input';
// import Loader from '../../components/common/Loader';
// import toast from 'react-hot-toast';
// import { uselocation } from "react-router-dom"

// const Staff = () => {
//   const [staff, setStaff] = useState([]);
//   const [filteredStaff, setFilteredStaff] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingStaff, setEditingStaff] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//   });
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     fetchStaff();
//   }, []);

//   useEffect(() => {
//     const filtered = staff.filter(member =>
//       member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       member.email.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredStaff(filtered);
//   }, [searchTerm, staff]);

//   const fetchStaff = async () => {
//     try {
//       const data = await staffService.getAllStaff();
//       setStaff(data);
//       setFilteredStaff(data);
//     } catch (error) {
//       toast.error('Failed to fetch staff');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       if (editingStaff) {
//         await staffService.updateStaff(editingStaff.id, formData);
//         toast.success('Staff updated successfully');
//       } else {
//         await staffService.addStaff(formData);
//         toast.success('Staff added successfully');
//       }

//       fetchStaff();
//       closeModal();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Operation failed');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (staffId) => {
//     if (!window.confirm('Are you sure you want to delete this staff member?')) return;

//     try {
//       await staffService.deleteStaff(staffId);
//       toast.success('Staff deleted successfully');
//       fetchStaff();
//     } catch (error) {
//       toast.error('Failed to delete staff');
//     }
//   };

//   // const toggleStaffStatus = async (staffMember) => {
//   //   try {
//   //     const newStatus = staffMember.isActive ? 'deactivate' : 'activate';
//   //     await staffService.updateStaff(staffMember.id, { isActive: !staffMember.isActive });
//   //     toast.success(`Staff ${newStatus}d successfully`);
//   //     fetchStaff();
//   //   } catch (error) {
//   //     toast.error('Failed to update staff status');
//   //   }
//   // };

//   const toggleStaffStatus = async (staffMember) => {
//   try {
//     if (staffMember.isActive) {
//       await staffService.deactivateStaff(staffMember.id);
//       toast.success("Staff deactivated successfully");
//     } else {
//       await staffService.activateStaff(staffMember.id);
//       toast.success("Staff activated successfully");
//     }

//     fetchStaff();
//   } catch (error) {
//     toast.error("Failed to update staff status");
//   }
// };


//   const openModal = (staffMember = null) => {
//     if (staffMember) {
//       setEditingStaff(staffMember);
//       setFormData({
//         name: staffMember.name,
//         email: staffMember.email,
//         password: '',
//       });
//     } else {
//       setEditingStaff(null);
//       setFormData({
//         name: '',
//         email: '',
//         password: '',
//       });
//     }
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setEditingStaff(null);
//     setFormData({
//       name: '',
//       email: '',
//       password: '',
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-96">
//         <Loader size="lg" />
//       </div>
//     );
//   }

//   const stats = {
//     total: staff.length,
//     active: staff.filter(s => s.isActive).length,
//     inactive: staff.filter(s => !s.isActive).length,
//   };

//   return (
//     <div className="px-6 pb-10 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
//             Staff Management
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             Manage your team members and their access
//           </p>
//         </div>
//         <button
//           onClick={() => openModal()}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
//         >
//           <Plus className="w-5 h-5" />
//           Add Staff Member
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
//           <div className="flex items-center justify-between mb-4">
//             <Users className="w-8 h-8 text-blue-600" />
//             <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Total</span>
//           </div>
//           <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Staff</p>
//         </div>

//         <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
//           <div className="flex items-center justify-between mb-4">
//             <UserCheck className="w-8 h-8 text-green-600" />
//             <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
//           </div>
//           <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Members</p>
//         </div>

//         <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
//           <div className="flex items-center justify-between mb-4">
//             <UserX className="w-8 h-8 text-orange-600" />
//             <span className="text-xs font-semibold px-3 py-1 bg-orange-100 text-orange-700 rounded-full">Inactive</span>
//           </div>
//           <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inactive}</p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Inactive Members</p>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="relative">
//         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search staff by name or email..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//         />
//       </div>

//       {/* Staff Grid */}
//       {filteredStaff.length === 0 ? (
//         <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
//           <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No staff members found</h3>
//           <p className="text-gray-600 dark:text-gray-400 mb-6">
//             {searchTerm ? 'Try adjusting your search' : 'Add staff members to help manage your business'}
//           </p>
//           {!searchTerm && (
//             <button
//               onClick={() => openModal()}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
//             >
//               <Plus className="w-5 h-5" />
//               Add Staff Member
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredStaff.map((member, index) => (
//             <div
//               key={member.id}
//               className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-xl"
//               style={{ animationDelay: `${index * 50}ms` }}
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
//                   <Users className="w-7 h-7 text-white" />
//                 </div>
//                 <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
//                   member.isActive 
//                     ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
//                     : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
//                 }`}>
//                   {member.isActive ? 'Active' : 'Inactive'}
//                 </span>
//               </div>

//               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
//                 {member.name}
//               </h3>
//               <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
//                 <Mail className="w-4 h-4" />
//                 {member.email}
//               </div>
//               <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
//                 <Shield className="w-4 h-4" />
//                 Staff Member
//               </div>

//               <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <button
//                   onClick={() => openModal(member)}
//                   className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
//                 >
//                   <Edit className="w-4 h-4" />
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => toggleStaffStatus(member)}
//                   className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                     member.isActive
//                       ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30'
//                       : 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
//                   }`}
//                 >
//                   {member.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
//                   {member.isActive ? 'Deactivate' : 'Activate'}
//                 </button>
//                 <button
//                   onClick={() => handleDelete(member.id)}
//                   className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//               {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <Input
//                 label="Full Name"
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 placeholder="Enter full name"
//                 required
//               />

//               <Input
//                 label="Email Address"
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 placeholder="Enter email address"
//                 required
//               />

//               {!editingStaff && (
//                 <Input
//                   label="Password"
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   placeholder="Enter password"
//                   required
//                 />
//               )}

//               <div className="flex justify-end gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
//                 >
//                   {submitting ? 'Saving...' : editingStaff ? 'Update' : 'Add'} Staff
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Staff;
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Search,
} from "lucide-react";
import { staffService } from "../../services/staffService";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const Staff = () => {
  const location = useLocation();

  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Auto open modal if ?add=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("add") === "true") {
      openModal();
    }
  }, [location]);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    const filtered = staff.filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStaff(filtered);
  }, [searchTerm, staff]);

  const fetchStaff = async () => {
    try {
      const data = await staffService.getAllStaff();
      setStaff(data);
      setFilteredStaff(data);
    } catch {
      toast.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingStaff) {
        await staffService.updateStaff(editingStaff.id, formData);
        toast.success("Staff updated successfully");
      } else {
        await staffService.addStaff(formData);
        toast.success("Staff added successfully");
      }

      fetchStaff();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStaffStatus = async (member) => {
    try {
      if (member.isActive) {
        await staffService.deactivateStaff(member.id);
        toast.success("Staff deactivated");
      } else {
        await staffService.activateStaff(member.id);
        toast.success("Staff activated");
      }
      fetchStaff();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;

    try {
      await staffService.deleteStaff(id);
      toast.success("Staff deleted");
      fetchStaff();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openModal = (member = null) => {
    if (member) {
      setEditingStaff(member);
      setFormData({
        name: member.name,
        email: member.email,
        password: "",
      });
    } else {
      setEditingStaff(null);
      setFormData({ name: "", email: "", password: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData({ name: "", email: "", password: "" });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );

  return (
    <div className="px-6 pb-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg"
        >
          <Plus size={18} />
          Add Staff
        </button>
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border"
          >
            <h3 className="font-bold text-lg">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.email}</p>

            <div className="flex gap-2 mt-4">
              <button onClick={() => openModal(member)}>
                <Edit size={18} />
              </button>

              <button onClick={() => toggleStaffStatus(member)}>
                {member.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
              </button>

              <button onClick={() => handleDelete(member.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? "Edit Staff" : "Add Staff"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <Input
                label="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              {!editingStaff && (
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}>
                  {editingStaff ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
