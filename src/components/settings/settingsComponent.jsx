// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { 
//   User, Lock, Bell, DollarSign, Shield, Globe, 
//   Mail, MessageSquare, Home, HelpCircle, ChevronRight, 
//   ArrowLeft, Save, Toggle, Trash2, Eye, EyeOff
// } from 'lucide-react';

// import { useAuth, useProfile, useWallet } from '../../hooks/hooks';

// const Settings = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id);
//   const { balance, loading: walletLoading } = useWallet(user?.id);
  
//   const [activeSection, setActiveSection] = useState('profile');
//   const [saving, setSaving] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
  
//   // Form states
//   const [profileForm, setProfileForm] = useState({
//     username: '',
//     name: '',
//     bio: '',
//     expertise: '',
//     rate_per_msg: 0,
//     email: ''
//   });
  
//   const [notificationPrefs, setNotificationPrefs] = useState({
//     messages: true,
//     transactions: true,
//     new_followers: true,
//     post_interactions: true,
//     marketing: false
//   });
  
//   const [privacySettings, setPrivacySettings] = useState({
//     requires_payment_for_dm: false,
//     dm_fee: 0,
//     subscription_fee: 0,
//     subscription_description: '',
//     profile_visibility: 'public'
//   });
  
//   const [securitySettings, setSecuritySettings] = useState({
//     two_factor_enabled: false,
//     login_notifications: true
//   });
  
//   useEffect(() => {
//     if (profile) {
//       setProfileForm({
//         username: profile.username || '',
//         name: profile.name || '',
//         bio: profile.bio || '',
//         expertise: profile.expertise || '',
//         rate_per_msg: profile.rate_per_msg || 0,
//         email: profile.email || ''
//       });
      
//       // Initialize notification preferences from profile data if available
//       if (profile.notification_preferences) {
//         setNotificationPrefs(profile.notification_preferences);
//       }
      
//       // Initialize privacy settings from profile data if available
//       if (profile.privacy_settings) {
//         setPrivacySettings({
//           ...privacySettings,
//           ...profile.privacy_settings,
//           requires_payment_for_dm: profile.requires_payment_for_dm || false,
//           dm_fee: profile.dm_fee || 0,
//           subscription_fee: profile.subscription_fee || 0,
//           subscription_description: profile.subscription_description || ''
//         });
//       }
//     }
//   }, [privacySettings, profile]);
  
//   const handleProfileFormChange = (e) => {
//     const { name, value } = e.target;
//     setProfileForm({
//       ...profileForm,
//       [name]: name === 'rate_per_msg' ? parseInt(value, 10) || 0 : value
//     });
//   };
  
//   const handleNotificationChange = (key) => {
//     setNotificationPrefs({
//       ...notificationPrefs,
//       [key]: !notificationPrefs[key]
//     });
//   };
  
//   const handlePrivacyChange = (key, value) => {
//     setPrivacySettings({
//       ...privacySettings,
//       [key]: value !== undefined ? value : !privacySettings[key]
//     });
//   };
  
//   const handleSecurityChange = (key) => {
//     setSecuritySettings({
//       ...securitySettings,
//       [key]: !securitySettings[key]
//     });
//   };
  
//   const saveSettings = async () => {
//     setSaving(true);
//     try {
//       // Based on which section is active, update different parts of the profile
//       let updateData = {};
      
//       if (activeSection === 'profile') {
//         updateData = {
//           ...profileForm
//         };
//       } else if (activeSection === 'notifications') {
//         updateData = {
//           notification_preferences: notificationPrefs
//         };
//       } else if (activeSection === 'privacy') {
//         updateData = {
//           privacy_settings: {
//             profile_visibility: privacySettings.profile_visibility
//           },
//           requires_payment_for_dm: privacySettings.requires_payment_for_dm,
//           dm_fee: privacySettings.dm_fee,
//           subscription_fee: privacySettings.subscription_fee,
//           subscription_description: privacySettings.subscription_description
//         };
//       } else if (activeSection === 'security') {
//         // Security updates would typically involve different API calls
//         // This is just a placeholder
//         updateData = {
//           security_settings: securitySettings
//         };
//       }
      
//       await updateProfile(updateData);
//       setSuccessMessage('Settings saved successfully');
      
//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage('');
//       }, 3000);
//     } catch (error) {
//       console.error('Error saving settings:', error);
//     } finally {
//       setSaving(false);
//     }
//   };
  
//   if (profileLoading || walletLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
//       </div>
//     );
//   }
  
//   const renderProfileSection = () => (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
//         <button 
//           className="text-xs text-red-600 hover:text-red-700 flex items-center"
//           onClick={() => navigate('/profile')}
//         >
//           View Public Profile
//           <ChevronRight size={14} className="ml-1" />
//         </button>
//       </div>
      
//       <div className="flex items-center space-x-3 mb-4">
//         <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-red-100">
//           <img src={profile?.avatar_url || "/api/placeholder/64/64"} alt="Profile" className="w-full h-full object-cover" />
//         </div>
//         <div>
//           <button className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">
//             Change Photo
//           </button>
//           <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max size 2MB</p>
//         </div>
//       </div>
      
//       <div className="grid md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
//           <input
//             type="text"
//             name="username"
//             value={profileForm.username}
//             onChange={handleProfileFormChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
//             placeholder="Your username"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//           <input
//             type="text"
//             name="name"
//             value={profileForm.name}
//             onChange={handleProfileFormChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
//             placeholder="Your full name"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={profileForm.email}
//             onChange={handleProfileFormChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
//             placeholder="Your email"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Area of Expertise</label>
//           <input
//             type="text"
//             name="expertise"
//             value={profileForm.expertise}
//             onChange={handleProfileFormChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
//             placeholder="E.g. Finance, Marketing, Technology"
//           />
//         </div>
        
//         <div className="md:col-span-2">
//           <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
//           <textarea
//             name="bio"
//             value={profileForm.bio}
//             onChange={handleProfileFormChange}
//             rows="3"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
//             placeholder="Tell others about yourself and your expertise"
//           ></textarea>
//         </div>
//       </div>
      
//       <div className="border-t border-gray-200 pt-4 mt-6">
//         <h3 className="text-md font-medium text-gray-800 mb-3">Messaging Rate</h3>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Message (UGX)</label>
//           <div className="flex items-center">
//             <input
//               type="number"
//               name="rate_per_msg"
//               value={profileForm.rate_per_msg}
//               onChange={handleProfileFormChange}
//               min="0"
//               step="1000"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
//             />
//           </div>
//           <p className="text-xs text-gray-500 mt-1">You will receive 85% of this amount after platform fees</p>
//         </div>
//       </div>
//     </div>
//   );
  
//   const renderNotificationsSection = () => (
//     <div className="space-y-4">
//       <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h2>
      
//       <div className="space-y-3">
//         <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
//           <div className="flex items-center">
//             <MessageSquare size={16} className="text-red-600 mr-2" />
//             <span className="text-sm text-gray-700">New messages</span>
//           </div>
//           <button
//             onClick={() => handleNotificationChange('messages')}
//             className={`w-10 h-5 rounded-full flex items-center transition-all duration-300 ${notificationPrefs.messages ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'}`}
//           >
//             <span className={`block w-4 h-4 rounded-full transition ${notificationPrefs.messages ? 'bg-white mr-0.5' : 'bg-white ml-0.5'}`}></span>
//           </button>
//         </div>
        
//         <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
//           <div className="flex items-center">
//             <DollarSign size={16} className="text-red-600 mr-2" />
//             <span className="text-sm text-gray-700">Transactions and payouts</span>
//           </div>
//           <button
//             onClick={() => handleNotificationChange('transactions')}
//             className={`w-10 h-5 rounded-full flex items-center transition-all duration-300 ${notificationPrefs.transactions ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'}`}
//           >
//             <span className={`block w-4 h-4 rounded-full transition ${notificationPrefs.transactions ? 'bg-white mr-0.5' : 'bg-white ml-0.5'}`}></span>
//           </button>
//         </div>
        
//         <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
//           <div className="flex items-center">
//             <User size={16} className="text-red-600 mr-2" />
//             <span className="text-sm text-gray-700">New followers and subscribers</span>
//           </div>
//           <button
//             onClick={() => handleNotificationChange('new_followers')}
//             className={`w-10 h-5 rounded-full flex items-center transition-all duration-300 ${notificationPrefs.new_followers ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'}`}
//           >
//             <span className={`block w-4 h-4 rounded-full transition ${notificationPrefs.new_followers ? 'bg-white mr-0.5' : 'bg-white ml-0.5'}`}></span>
//           </button>
//         </div>
        
//         <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
//           <div className="flex items-center">
//             <MessageSquare size={16} className="text-red-600 mr-2" />
//             <span className="text-sm text-gray-700">Post likes, comments, and shares</span>
//           </div>
//           <button
//             onClick={() => handleNotificationChange('post_interactions')}
//             className={`w-10 h-5 rounded-full flex items-center transition-all duration-300 ${notificationPrefs.post_interactions ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'}`}
//           >
//             <span className={`block w-4 h-4 rounded-full transition ${notificationPrefs.post_interactions ? 'bg-white mr-0.5' : 'bg-white ml-0.5'}`}></span>
//           </button>
//         </div>
        
//         <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
//           <div className="flex items-center">
//             <Mail size={16} className="text-red-600 mr-2" />
//             <span className="text-sm text-gray-700">Marketing emails and updates</span>
//           </div>
//           <button
//             onClick={() => handleNotificationChange('marketing')}
//             className={`w-10 h-5 rounded-full flex items-center transition-all duration-300 ${notificationPrefs.marketing ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'}`}
//           >
//             <span className={`block w-4 h-4 rounded-full transition ${notificationPrefs.marketing ? 'bg-white mr-0.5' : 'bg-white ml-0.5'}`}></span>
//           </button>
//         </div>
//       </div>
      
//       <div className="text-xs text-gray-500 mt-2">
//         We'll always send you important notifications about your account activity and security.
//       </div>
//     </div>
//   );
  
//   const renderPrivacySection = () => (
//     <div className="space-y-4">
//       <h2 className="text-lg font-semibold text-gray-800 mb-4">Privacy & Monetization</h2>
      
//       <div className="border-b border-gray-200 pb-4 mb-4">
//         <h3 className="text-md font-medium text-gray-700 mb-3">Profile Visibility</h3>
        
//         <div className="space-y-2">
//           <div className="flex items-center">
//             <input
//               type="radio"
//               id="public"
//               name="visibility"
//               checked={privacySettings.profile_visibility === 'public'}
//               onChange={() => handlePrivacyChange('profile_visibility', 'public')}
//               className="h-4 w-4 text-red-600 focus:ring-red-500"
//             />
//             <label htmlFor="public" className="ml-2 text-sm text-gray-700">
//               Public - Anyone can view your profile and posts
//             </label>
//           </div>
          
//           <div className="flex items-center">
//             <input
//               type="radio"
//               id="limited"
//               name="visibility"
//               checked={privacySettings.profile_visibility === 'limited'}
//               onChange={() => handlePrivacyChange('profile_visibility', 'limited')}
//               className="h-4 w-4 text-red-600 focus:ring-red-500"
//             />
//             <label htmlFor="limited" className="ml-2 text-sm text-gray-700">
//               Limited - Only subscribers can view your premium content
//             </label>
//           </div>
          
//           <div className="flex items-center">
//             <input
//               type="radio"
//               id="private"
//               name="visibility"
//               checked={privacySettings.profile_visibility === 'private'}
//               onChange={() => handlePrivacyChange('profile_visibility', 'private')}
//               className="h-4 w-4 text-red-600 focus:ring-red-500"
//             />
//             <label htmlFor="private" className="ml-2 text-sm text-gray-700">
//               Private - Only approved users can view your profile
//             </label>
//           </div>
//         </div>
//       </div>
      
//       <div className="border-b border-gray-200 pb-4 mb-4">
//         <h3 className="text-md font-medium text-gray-700 mb-3">Direct Messages</h3>
        
//         <div className="flex items-center justify-between mb-3">
//           <span className="text-sm text-gray-700">Require payment for DMs</span>
//           <button
//             onClick={() => handlePrivacyChange('requires_payment_for_dm')}
//             className={`w-10 h-5 rounded-full flex items-center transition-all duration-300 ${privacySettings.requires_payment_for_dm ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'}`}
//           >
//             <span className={`block w-4 h-4 rounded-full transition ${privacySettings.requires_payment_for_dm ? 'bg-white mr-0.5' : 'bg-white ml-0.5'}`}></span>
//           </button>
//         </div>
        
//         {privacySettings.requires_payment_for_dm && (
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">DM Fee (UGX)</label>
//             <input
//               type="number"
//               value={privacySettings.dm_fee}
//               onChange={(e) => handlePrivacyChange('dm_fee', parseInt(e.target.value, 10) || 0)}
//               min="0"
//               step="1000"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
//             />
//             <p className="text-xs text-gray-500 mt-1">This is a one-time fee for users to start a conversation with you</p>
//           </div>
//         )}
//       </div>
      
//       <div>
//         <h3 className="text-md font-medium text-gray-700 mb-3">Subscription Settings</h3>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Subscription Fee (UGX)</label>
//           <input
//             type="number"
//             value={privacySettings.subscription_fee}
//             onChange={(e) => handlePrivacyChange('subscription_fee', parseInt(e.target.value, 10) || 0)}
//             min="0"
//             step="5000"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
//           />
//         </div>
        
//         <div className="mt-3">
//           <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Description</label>
//           <textarea
//             value={privacySettings.subscription_description}
//             onChange={(e) => handlePrivacyChange('subscription_description', e.target.value)}
//             rows="3"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
//             placeholder="Describe what subscribers will get access to"
//           ></textarea>
//         </div>
//       </div>
//     </div>
//   );
  
//   const renderSecuritySection = () => (
//     <div className="space-y-4">
//       <h2 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h2>
      
//       <div className="border-b border-gray-200 pb-4 mb-4">
//         <h3 className="text-md font-medium text-gray-700 mb-3">Password</h3>
        
//         <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium">
//           Change Password
//         </button>
//       </div>
      
//       <div className="border-b border-gray-200 pb-4 mb-4">
//         <div className="flex items-center justify-between mb-3">
//           <div>
//             <h3 className="text-md font-medium text-gray-700">Two-Factor Authentication</h3>
//             <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
//           </div>
//           <button
//             onClick={() => handleSecurityChange('two_factor_enabled')}
//             className={`w-10 h-5 rounded-full flex items-center transition-all duration-300 ${securitySettings.two_factor_enabled ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'}`}
//           >
//             <span className={`block w-4 h-4 rounded-full transition ${securitySettings.two_factor_enabled ? 'bg-white mr-0.5' : 'bg-white ml-0.5'}`}></span>
//           </button>
//         </div>
//       </div>
      
//       <div className="border-b border-gray-200 pb-4 mb-4">
//         <div className="flex items-center justify-between mb-3">
//           <div>
//             <h3 className="text-md font-medium text-gray-700">Login Notifications</h3>
//             <p className="text-xs text-gray-500">Receive alerts about new login attempts</p>
//           </div>
//           <button
//             onClick={() => handleSecurityChange('login_notifications')}
//             className={`w-10 h-5 rounded-full flex items-center transition-all duration-300 ${securitySettings.login_notifications ? 'bg-red-600 justify-end' : 'bg-gray-300 justify-start'}`}
//           >
//             <span className={`block w-4 h-4 rounded-full transition ${securitySettings.login_notifications ? 'bg-white mr-0.5' : 'bg-white ml-0.5'}`}></span>
//           </button>
//         </div>
//       </div>
      
//       <div>
//         <h3 className="text-md font-medium text-gray-700 mb-3">Account Management</h3>
        
//         <button className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center">
//           <Trash2 size={16} className="mr-1" />
//           Deactivate Account
//         </button>
//       </div>
//     </div>
//   );
  
//   const renderActiveSection = () => {
//     switch (activeSection) {
//       case 'profile':
//         return renderProfileSection();
//       case 'notifications':
//         return renderNotificationsSection();
//       case 'privacy':
//         return renderPrivacySection();
//       case 'security':
//         return renderSecuritySection();
//       default:
//         return renderProfileSection();
//     }
//   };
  
//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Left Sidebar */}
//       <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-3">
//         <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-lg font-bold py-2 px-3 rounded-lg mb-6">
//           PayPadm
//         </div>
        
//         <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mb-4">
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           <span className="font-medium">Back to Home</span>
//         </Link>
        
//         <div className="mb-4">
//           <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//             Settings
//           </h3>
          
//           <nav className="mt-2 space-y-1">
//             <button 
//               className={`w-full flex items-center px-3 py-2 ${activeSection === 'profile' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-100'} rounded-lg`}
//               onClick={() => setActiveSection('profile')}
//             >
//               <User className="w-4 h-4 mr-2" />
//               <span className="font-medium">Profile</span>
//             </button>
            
//             <button 
//               className={`w-full flex items-center px-3 py-2 ${activeSection === 'notifications' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-100'} rounded-lg`}
//               onClick={() => setActiveSection('notifications')}
//             >
//               <Bell className="w-4 h-4 mr-2" />
//               <span className="font-medium">Notifications</span>
//             </button>
            
//             <button 
//               className={`w-full flex items-center px-3 py-2 ${activeSection === 'privacy' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-100'} rounded-lg`}
//               onClick={() => setActiveSection('privacy')}
//             >
//               <Globe className="w-4 h-4 mr-2" />
//               <span className="font-medium">Privacy & Monetization</span>
//             </button>
            
//             <button 
//               className={`w-full flex items-center px-3 py-2 ${activeSection === 'security' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-100'} rounded-lg`}
//               onClick={() => setActiveSection('security')}
//             >
//               <Shield className="w-4 h-4 mr-2" />
//               <span className="font-medium">Security</span>
//             </button>
//           </nav>
//         </div>
        
//         <div className="mt-auto">
//           <div className="bg-red-50 rounded-lg p-3 border border-red-100">
//             <div className="flex items-center text-gray-800 mb-2">
//               <DollarSign className="w-4 h-4 text-red-600 mr-1" />
//               <h3 className="text-sm font-semibold">Current Balance</h3>
//             </div>
//             <p className="text-lg font-bold text-gray-900 mb-2">
//               {walletLoading ? '...' : `${balance ? balance.toLocaleString() : 0} UGX`}
//             </p>
//             <Link to="/wallet/withdraw">
//               <button className="w-full bg-red-600 text-white text-xs py-1.5 px-2 rounded-lg font-medium hover:bg-red-700">
//                 Withdraw Funds
//               </button>
//             </Link>
//           </div>
          
//           <div className="mt-3 space-y-1 text-xs">
//             <Link to="/help" className="flex items-center justify-between text-gray-600 p-2 hover:bg-gray-100 rounded">
//               <div className="flex items-center">
//                 <HelpCircle size={14} className="mr-2" />
//                 <span>Help Center</span>
//               </div>
//               <ChevronRight size={14} />
//             </Link>
//           </div>
//         </div>
//       </div>
      
//       {/* Main Content */}
//       <div className="flex-1 overflow-auto">
//         {/* Mobile Header */}
//         <div className="md:hidden bg-white p-3 border-b border-gray-200 sticky top-0 z-10">
//           <div className="flex items-center justify-between">
//             <Link to="/" className="flex items-center text-gray-800">
//               <ArrowLeft className="w-5 h-5 mr-2" />
//               <span className="font-medium">Settings</span>
//             </Link>
            
//             <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
//               <img src={profile?.avatar_url || "/api/placeholder/32/32"} alt="Profile" className="w-full h-full object-cover" />
//             </div>
//           </div>
          
//           <div className="flex overflow-x-auto space-x-1 mt-3 pb-1 no-scrollbar">
//             <button 
//               className={`px-3 py-1.5 font-medium text-sm rounded-full whitespace-nowrap ${activeSection === 'profile' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
//               onClick={() => setActiveSection('profile')}
//             >
//               Profile
//             </button>
//             <button 
//               className={`px-3 py-1.5 font-medium text-sm rounded-full whitespace-nowrap ${activeSection === 'notifications' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
//               onClick={() => setActiveSection('notifications')}
//             >
//               Notifications
//             </button>
//             <button 
//               className={`px-3 py-1.5 font-medium text-sm rounded-full whitespace-nowrap ${activeSection === 'privacy' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
//               onClick={() => setActiveSection('privacy')}
//             >
//               Privacy
//             </button>
//             <button 
//               className={`px-3 py-1.5 font-medium text-sm rounded-full whitespace-nowrap ${activeSection === 'security' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
//               onClick={() => setActiveSection('security')}
//             >
//               Security
//             </button>
//           </div>
//         </div>
        
//         {/* Content Area */}
//         <div className="p-4 md:p-6 max-w-4xl mx-auto">
//           {/* Success Message */}
//           {successMessage && (
//             <div className="mb-4 bg-green-50 text-green-800 p-3 rounded-lg flex items-center">
//               <span className="mr-2">✓</span>
//               {successMessage}
//             </div>
//           )}
          
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
//             {renderActiveSection()}
            
//             <div className="mt-6 flex justify-end">
//               <button
//                 onClick={saveSettings}
//                 disabled={saving}
//                 className={`flex items-center px-4 py-2 rounded-lg text-white font-medium ${
//                   saving ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
//                 }`}
//               >
//                 {saving ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save size={16} className="mr-2" />
//                     Save Changes
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Settings;