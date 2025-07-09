import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

const ProfileEditForm = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    bio: '',
    gender: '',
    sexual_orientation: '',
    born: '',
    location: '',
    contact: '',
    interests: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        gender: profile.gender || '',
        sexual_orientation: profile.sexual_orientation || '',
        born: profile.born || '',
        location: profile.location || '',
        contact: profile.contact || '',
        interests: profile.interests || '',
      });
    }
  }, [profile]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl p-4 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Edit Profile</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* Profile Photo Section */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-red-100">
            <img
              src={profile?.avatar_url || '/api/placeholder/64/64'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <button className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">
            Change Photo
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="born"
                value={formData.born}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sexual Orientation
            </label>
            <select
              name="sexual_orientation"
              value={formData.sexual_orientation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">Select...</option>
              <option value="straight">Straight</option>
              <option value="gay">Gay</option>
              <option value="lesbian">Lesbian</option>
              <option value="bisexual">Bisexual</option>
              <option value="pansexual">Pansexual</option>
              <option value="asexual">Asexual</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone number or other contact info"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interests
            </label>
            <textarea
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              rows="2"
              placeholder="What are you interested in? (e.g., music, travel, sports)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;