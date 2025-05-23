import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

const ProfileEditForm = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
    expertise: '',
    email: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        name: profile.name || '',
        bio: profile.bio || '',
        expertise: profile.expertise || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl p-4 max-w-sm w-full mx-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Edit Profile</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-red-100">
            <img src={profile?.avatar_url || "/api/placeholder/64/64"} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">
            Change Photo
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label>
            <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="mr-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium">Cancel</button>
          <button onClick={handleSubmit} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;