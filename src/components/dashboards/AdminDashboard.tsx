import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../lib/storage';
import { User, Course, Assessment, Announcement, CompetencyMap, Role } from '../../types';
import { Users, BookOpen, ShieldAlert, Award, FileText, Bell, Search, LayoutDashboard, Target, UserPlus, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RealTimeClock } from '../common/RealTimeClock';

type ViewState = 'overview' | 'users' | 'courses' | 'certificates' | 'announcements' | 'advanced';

export const AdminDashboard: React.FC<{ currentView?: string }> = ({ currentView }) => {
  const { user } = useAuth();
  const [view, setView] = useState<ViewState>('overview');

  useEffect(() => {
    if (currentView && currentView !== 'home') {
      // Map 'courses' to 'courses', 'users' to 'users', etc.
      // We fallback to 'overview' if the currentView is not one of the ViewState keys.
      const mappedView = currentView === 'courses' ? 'courses' : currentView;
      setView(mappedView as ViewState);
    }
  }, [currentView]);
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [competencies, setCompetencies] = useState<CompetencyMap[]>([]);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annTarget, setAnnTarget] = useState<'all' | 'trainee' | 'trainer'>('all');

  // Competency Form State
  const [compRole, setCompRole] = useState('');
  const [compSkills, setCompSkills] = useState('');

  // Trainer Search State
  const [searchSkill, setSearchSkill] = useState('');
  
  // User Filter & Search State
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [roleUserFilter, setRoleUserFilter] = useState<'all' | Role>('all');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('trainee');

  const loadData = () => {
    setUsers(storage.getUsers());
    setCourses(storage.getCourses());
    setAssessments(storage.getAllAssessments());
    setAnnouncements(storage.getAnnouncements());
    setCompetencies(storage.getCompetencies());
  };

  useEffect(() => {
    loadData();

    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener('capacity_data_changed', handleDataChange);
    window.addEventListener('storage', handleDataChange);
    window.addEventListener('focus', handleDataChange);

    return () => {
      window.removeEventListener('capacity_data_changed', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('focus', handleDataChange);
    };
  }, [view]);

  // Actions
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      alert("Please fill in all required fields (Name, Email, Password).");
      return;
    }
    const existing = storage.getUserByEmail(newUserEmail.trim());
    if (existing) {
      alert("A user with this email address is already registered.");
      return;
    }

    const createdUser: User = {
      id: `user_${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword,
      role: newUserRole,
      status: 'approved',
      createdAt: new Date().toISOString(),
      profile: {}
    };

    storage.saveUser(createdUser);
    loadData();
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    alert(`User "${createdUser.name}" created successfully as ${createdUser.role.toUpperCase()}!`);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      storage.deleteUser(userId);
      loadData();
    }
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveAnnouncement({
      id: `ann_${Date.now()}`,
      title: annTitle,
      message: annMessage,
      targetRole: annTarget,
      sentAt: new Date().toISOString()
    });
    setAnnTitle('');
    setAnnMessage('');
    loadData();
    alert('Announcement broadcasted.');
  };

  const handleSaveCompetency = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = compSkills.split(',').map(s => s.trim()).filter(Boolean);
    storage.saveCompetency({
      id: `comp_${Date.now()}`,
      roleTitle: compRole,
      requiredSkills: skillsArray
    });
    setCompRole('');
    setCompSkills('');
    loadData();
  };

  // Chart Data
  const roleDistribution = [
    { name: 'Trainees', value: users.filter(u => u.role === 'trainee').length },
    { name: 'Trainers', value: users.filter(u => u.role === 'trainer').length },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
  ];
  const COLORS = ['#3B82F6', '#10B981', '#6366F1'];

  const courseStats = [
    { name: 'Published', count: courses.filter(c => c.status === 'published').length },
    { name: 'Drafts', count: courses.filter(c => c.status === 'draft').length },
  ];

  const suitableTrainers = searchSkill 
    ? users.filter(u => u.role === 'trainer' && u.profile.skills?.toLowerCase().includes(searchSkill.toLowerCase()))
    : [];

  return (
    <div className="flex-1 overflow-y-auto">
        
        {/* Global Dashboard */}
        {view === 'overview' && (
          <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Platform Overview</h2>
                  <RealTimeClock variant="nav" />
                </div>
                <p className="text-sm text-gray-500 mt-1">Real-time statistics and user registrations saved in local storage.</p>
              </div>
              <button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Register New User
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Registered Users</p>
                <p className="text-3xl font-black text-gray-900">{users.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Active Trainees</p>
                <p className="text-3xl font-black text-blue-600">{users.filter(u => u.role === 'trainee').length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Active Trainers</p>
                <p className="text-3xl font-black text-emerald-600">{users.filter(u => u.role === 'trainer').length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">Active Courses</p>
                <p className="text-3xl font-black text-purple-600">{courses.length}</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">User Role Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                        {roleDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-6 mt-4">
                  <span className="flex items-center text-sm text-gray-600"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Trainees</span>
                  <span className="flex items-center text-sm text-gray-600"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Trainers</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Course Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* All Registrations Overview Table */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Registered Users ({users.length})</h3>
                  <p className="text-xs text-gray-500">Every user who registers automatically appears here and can access the platform instantly.</p>
                </div>
                <button 
                  onClick={() => setView('users')} 
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Manage All Users →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">User Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Registered Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {users.slice(0, 10).map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-900">{u.name}</td>
                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'trainer' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {u.id !== user?.id ? (
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:underline font-bold">Delete</button>
                          ) : (
                            <span className="text-gray-400 italic">Current Admin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        {view === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-500">View real-time registered user records stored in local storage, search accounts, or add new users.</p>
              </div>
              <button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm shrink-0"
              >
                <UserPlus className="w-4 h-4 mr-2" /> + Register New User
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search registered user by name, email, or role..." 
                  value={searchUserQuery} 
                  onChange={e => setSearchUserQuery(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-gray-500 uppercase">Filter Role:</span>
                <select 
                  value={roleUserFilter} 
                  onChange={e => setRoleUserFilter(e.target.value as any)} 
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold bg-gray-50 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="trainee">Trainees ({users.filter(u => u.role === 'trainee').length})</option>
                  <option value="trainer">Trainers ({users.filter(u => u.role === 'trainer').length})</option>
                  <option value="admin">Admins ({users.filter(u => u.role === 'admin').length})</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User / Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Password</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Registered On</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users
                      .filter(u => {
                        const matchRole = roleUserFilter === 'all' ? true : u.role === roleUserFilter;
                        const matchQuery = !searchUserQuery.trim() || 
                          u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                          u.role.toLowerCase().includes(searchUserQuery.toLowerCase());
                        return matchRole && matchQuery;
                      })
                      .map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-900 text-sm">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            u.role === 'trainer' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">
                            {u.password || '••••••••'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleString() : 'Registered'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {u.id !== user?.id ? (
                              <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:bg-red-100 font-bold bg-red-50 px-2.5 py-1 rounded border border-red-200 text-xs">Delete User</button>
                            ) : (
                              <span className="text-xs text-gray-400 font-bold italic">You (Current Admin)</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Add New User */}
            {isAddUserModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 text-blue-600" /> Register New User
                    </h3>
                    <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">×</button>
                  </div>

                  <form onSubmit={handleAddUserSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Anshu Sharma" 
                        value={newUserName} 
                        onChange={e => setNewUserName(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. user@example.com" 
                        value={newUserEmail} 
                        onChange={e => setNewUserEmail(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Set user password" 
                        value={newUserPassword} 
                        onChange={e => setNewUserPassword(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assign Role</label>
                      <select 
                        value={newUserRole} 
                        onChange={e => setNewUserRole(e.target.value as Role)} 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 font-semibold"
                      >
                        <option value="trainee">Trainee</option>
                        <option value="trainer">Trainer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-3 border-t">
                      <button 
                        type="button"
                        onClick={() => setIsAddUserModalOpen(false)} 
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                      >
                        Create Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Course Monitor */}
        {view === 'courses' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Course & Assessment Monitor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(c => {
                const trainer = storage.getUserById(c.trainerId);
                const courseAssts = assessments.filter(a => a.courseId === c.id);
                return (
                  <div key={c.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{c.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">Trainer: {trainer?.name || 'Unknown'}</p>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Assessments Attached: {courseAssts.length}</p>
                      <ul className="space-y-1">
                        {courseAssts.map(a => <li key={a.id} className="text-xs text-gray-500">- {a.title}</li>)}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Certifications Management */}
        {view === 'certificates' && (
          <div className="space-y-6 max-w-4xl mx-auto text-center py-12 bg-white rounded-xl border border-gray-200">
             <Award className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-gray-900 mb-2">Certifications Directory</h2>
             <p className="text-gray-500 max-w-md mx-auto">This module automatically tracks certificates issued to trainees upon course completion. No manual intervention required.</p>
             <div className="mt-8 flex justify-center">
               <div className="bg-gray-50 px-6 py-4 rounded-lg border border-gray-200 text-left">
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Total System Certificates</p>
                  <p className="text-4xl font-bold text-indigo-600">{storage.getAllEnrollments().filter(e=>e.status === 'completed').length}</p>
               </div>
             </div>
          </div>
        )}

        {/* Announcements */}
        {view === 'announcements' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Announcements</h2>
              <p className="text-gray-500">Draft and broadcast notifications to users.</p>
            </div>
            
            <form onSubmit={handleSendAnnouncement} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target Audience</label>
                <select value={annTarget} onChange={e=>setAnnTarget(e.target.value as any)} className="w-full border-gray-300 rounded-md shadow-sm border p-2">
                  <option value="all">All Users</option>
                  <option value="trainee">Trainees Only</option>
                  <option value="trainer">Trainers Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                <input required type="text" value={annTitle} onChange={e=>setAnnTitle(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Message Body</label>
                <textarea required rows={4} value={annMessage} onChange={e=>setAnnMessage(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm border p-2"></textarea>
              </div>
              <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700">Broadcast</button>
            </form>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Broadcast History</h3>
              {announcements.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-900">{a.title}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold uppercase text-gray-600">Target: {a.targetRole}</span>
                  </div>
                  <p className="text-sm text-gray-600">{a.message}</p>
                </div>
              ))}
              {announcements.length === 0 && <p className="text-sm text-gray-500">No announcements sent.</p>}
            </div>
          </div>
        )}

        {/* Advanced Ops */}
        {view === 'advanced' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900">Advanced Operations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Competency Mapping */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Target className="w-5 h-5 mr-2 text-indigo-500"/> Competency Mapping</h3>
                <form onSubmit={handleSaveCompetency} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Role Title (e.g., Manager)</label>
                    <input required type="text" value={compRole} onChange={e=>setCompRole(e.target.value)} className="w-full border border-gray-300 rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Required Skills (Comma separated)</label>
                    <input required type="text" value={compSkills} onChange={e=>setCompSkills(e.target.value)} className="w-full border border-gray-300 rounded p-2" placeholder="Leadership, Communication" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold py-2 rounded hover:bg-indigo-100">Define Framework</button>
                </form>

                <div className="space-y-2">
                  {competencies.map(c => (
                    <div key={c.id} className="p-3 bg-gray-50 border border-gray-100 rounded">
                      <p className="font-bold text-sm text-gray-900">{c.roleTitle}</p>
                      <p className="text-xs text-gray-600 mt-1">{c.requiredSkills.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identify Trainers */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Search className="w-5 h-5 mr-2 text-indigo-500"/> Identify Suitable Trainers</h3>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Search by Skill / Expertise</label>
                  <input type="text" value={searchSkill} onChange={e=>setSearchSkill(e.target.value)} placeholder="e.g. Leadership" className="w-full border border-gray-300 rounded p-2 focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                
                <div className="space-y-3">
                  {searchSkill && suitableTrainers.length > 0 ? suitableTrainers.map(t => (
                    <div key={t.id} className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold text-indigo-900">{t.name}</p>
                        <p className="text-xs text-indigo-700 mt-1">Skills: {t.profile.skills}</p>
                      </div>
                      <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">Match</span>
                    </div>
                  )) : searchSkill ? (
                    <p className="text-sm text-gray-500">No trainers found with that skill.</p>
                  ) : (
                    <p className="text-sm text-gray-500">Type a skill above to find matching trainers in the system.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
  );
};
