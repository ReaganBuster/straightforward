import { useState, useRef, useEffect } from 'react';
import { Image, Lock, Unlock, X, BarChart2, Send, CircleAlert, MessageSquare, DollarSign, Users, FileText, Calendar, Gift, TrendingUp } from 'lucide-react';
import { supabase } from '../../services/supabase';

const NewPost = ({ user, onPostCreated, onClose, inFeed = false }) => {
  const [content, setContent] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [postFee, setPostFee] = useState(5000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [monetizationModel, setMonetizationModel] = useState('');
  const [showMonetizationOptions, setShowMonetizationOptions] = useState(false);
  const [dmFee, setDmFee] = useState(2000);
  const [enablePaidDMs, setEnablePaidDMs] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [monetizationTypeId, setMonetizationTypeId] = useState(null);
  const [monetizationTypesList, setMonetizationTypesList] = useState([]);
  const [selectedMonetizationType, setSelectedMonetizationType] = useState(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // Pre-defined topic suggestions
  const suggestedTopics = [
    'Finance', 'Business', 'Tech', 'Health', 'Education',
    'Marketing', 'Investing', 'Crypto', 'Career', 'Mobile Money'
  ];

  // Monetization models with mapping to new monetization_types
  const monetizationModels = [
    { 
      id: 'content_unlock', 
      name: 'Pay-to-Unlock Post', 
      icon: <Lock size={14} />,
      category: 'content'
    },
    { 
      id: 'paid_dm', 
      name: 'Paid Direct Messaging', 
      icon: <MessageSquare size={14} />,
      category: 'messaging'
    },
    { 
      id: 'user_subscription', 
      name: 'Subscription Access', 
      icon: <Users size={14} />,
      category: 'subscription'
    },
    { 
      id: 'file_download', 
      name: 'File Download', 
      icon: <FileText size={14} />,
      category: 'content'
    },
    { 
      id: 'tip', 
      name: 'Tipping Enabled', 
      icon: <Gift size={14} />,
      category: 'community'
    },
    { 
      id: 'post_boost', 
      name: 'Boost This Post', 
      icon: <TrendingUp size={14} />,
      category: 'community'
    }
  ];

  // Fetch monetization types from the database on component mount
  useEffect(() => {
    async function fetchMonetizationTypes() {
      try {
        const { data, error } = await supabase
          .from('monetization_types')
          .select('*')
          .eq('is_active', true);
          
        if (error) throw error;
        
        setMonetizationTypesList(data);
      } catch (err) {
        console.error('Error fetching monetization types:', err);
      }
    }
    
    fetchMonetizationTypes();
  }, []);

  // Handle monetization model selection effects
  useEffect(() => {
    if (!monetizationModel) {
      setIsPremium(false);
      setEnablePaidDMs(false);
      setMonetizationTypeId(null);
      setSelectedMonetizationType(null);
      return;
    }
    
    // Find the corresponding monetization type in our fetched list
    const selectedType = monetizationTypesList.find(type => type.type_code === monetizationModel);
    setSelectedMonetizationType(selectedType);
    
    if (selectedType) {
      setMonetizationTypeId(selectedType.type_id);
    }
    
    // Set appropriate options based on selected monetization model
    switch(monetizationModel) {
      case 'content_unlock':
        setIsPremium(true);
        setEnablePaidDMs(false);
        break;
      case 'paid_dm':
        setIsPremium(false);
        setEnablePaidDMs(true);
        break;
      case 'user_subscription':
        setIsPremium(false);
        setEnablePaidDMs(false);
        break;
      case 'file_download':
        setIsPremium(true);
        setEnablePaidDMs(false);
        break;
      case 'tip':
      case 'post_boost':
        setIsPremium(false);
        setEnablePaidDMs(false);
        break;
      default:
        setIsPremium(false);
        setEnablePaidDMs(false);
    }
  }, [monetizationModel, monetizationTypesList]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setError('Please select an image file');
    }
  };
  
  const handleTopicToggle = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : prev.length < 5 ? [...prev, topic] : prev
    );
    
    if (!selectedTopics.includes(topic) && selectedTopics.length >= 5) {
      setError('You can only select up to 5 topics');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please enter some content for your post');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Handle image upload if present
      let imageUrl = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.user_id}-${Date.now()}.${fileExt}`;
        const filePath = `post-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, selectedImage);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Create post with monetization details
      const postData = {
        user_id: user.user_id,
        content: content,
        image_url: imageUrl,
        is_premium: isPremium,
        trending_category: selectedTopics[0] || 'General',
        // These are the main changes to support our new schema
        monetization_model: monetizationModel, // Keep for backward compatibility
        monetization_type_id: monetizationTypeId,
        content_fee: isPremium ? postFee : null,
        dm_fee: enablePaidDMs ? dmFee : null,
        preview_content: previewContent || null,
        has_attachments: !!selectedImage,
        requires_subscription: monetizationModel === 'user_subscription'
      };
      
      // Insert the post
      const { data: newPostData, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select('post_id')
        .single();
      
      if (postError) throw postError;
      
      // If there's a monetization type selected, add to monetization_settings
      if (monetizationTypeId) {
        // First check if this setting already exists
        const { data: existingSettings } = await supabase
          .from('monetization_settings')
          .select('setting_id')
          .eq('user_id', user.user_id)
          .eq('monetization_type_id', monetizationTypeId)
          .single();
          
        if (!existingSettings) {
          // Create new monetization setting for this user if it doesn't exist
          const monetizationSetting = {
            user_id: user.user_id,
            monetization_type_id: monetizationTypeId,
            is_enabled: true,
            price_amount: isPremium ? postFee : (enablePaidDMs ? dmFee : 0),
            description: `Setting for ${monetizationModel}`,
          };
          
          await supabase
            .from('monetization_settings')
            .insert(monetizationSetting);
        }
      }
      
      // Insert topics if any
      if (selectedTopics.length > 0) {
        const topicInserts = selectedTopics.map(topic => ({
          post_id: newPostData.post_id,
          topic: topic
        }));
        
        const { error: topicError } = await supabase
          .from('post_topics')
          .insert(topicInserts);
          
        if (topicError) throw topicError;
      }
      
      // Reset form and notify parent
      setContent('');
      setIsPremium(false);
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedTopics([]);
      setMonetizationModel('');
      setEnablePaidDMs(false);
      setPreviewContent('');
      setMonetizationTypeId(null);
      onPostCreated && onPostCreated(newPostData);
      !inFeed && onClose && onClose();
      
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg">
      {!inFeed && (
        <div className="flex justify-between p-3 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">New Post</h2>
          <button onClick={onClose} className="text-gray-500">
            <X size={20} />
          </button>
        </div>
      )}
      
      <div className="p-3">
        <div className="flex mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
            <img 
              src={user?.profile_avatar_url || "/api/placeholder/32/32"} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <textarea
              placeholder="Share your insights or ask a question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 min-h-20 resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-right text-gray-500">{content.length}/1000</div>
          </div>
        </div>
        
        {imagePreview && (
          <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-200">
            <img src={imagePreview} alt="Selected" className="w-full max-h-56 object-contain" />
            <button 
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-60 text-white p-1 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        )}
        
        {selectedTopics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {selectedTopics.map(topic => (
              <div key={topic} className="flex items-center bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs">
                #{topic}
                <button onClick={() => handleTopicToggle(topic)} className="ml-1">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {showTopicSelector && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map(topic => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className={`px-2 py-0.5 rounded-full text-xs transition ${
                    selectedTopics.includes(topic)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {showMonetizationOptions && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium mb-2 text-gray-700">Monetization Options</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {monetizationModels.map(model => (
                <button
                  key={model.id}
                  onClick={() => setMonetizationModel(model.id)}
                  className={`px-3 py-1 rounded-full text-xs flex items-center transition ${
                    monetizationModel === model.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  <span className="mr-1">{model.icon}</span>
                  {model.name}
                </button>
              ))}
              <button
                onClick={() => {
                  setMonetizationModel('');
                  setIsPremium(false);
                  setEnablePaidDMs(false);
                }}
                className={`px-3 py-1 rounded-full text-xs flex items-center transition ${
                  !monetizationModel
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <span className="mr-1"><Unlock size={14} /></span>
                Free (No Monetization)
              </button>
            </div>
            
            {/* Show advanced settings toggle only when a monetization type is selected */}
            {monetizationModel && (
              <div className="mt-2">
                <button 
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-xs text-red-600 flex items-center"
                >
                  {showAdvancedSettings ? 'Hide' : 'Show'} advanced settings
                  <span className="ml-1">{showAdvancedSettings ? '▲' : '▼'}</span>
                </button>
              </div>
            )}
            
            {/* Advanced Settings Section */}
            {showAdvancedSettings && monetizationModel === 'content_unlock' && (
              <div className="mt-2 border-t border-gray-200 pt-2">
                <div className="text-xs text-gray-700 mb-1">Preview content (shown before unlock)</div>
                <textarea
                  placeholder="Add a teaser that will be visible before content unlock..."
                  value={previewContent}
                  onChange={(e) => setPreviewContent(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 text-xs resize-none h-16"
                  maxLength={200}
                />
              </div>
            )}
          </div>
        )}
        
        {isPremium && (
          <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center text-red-800 mb-1">
              <Lock size={14} className="mr-1" />
              <span className="text-sm font-medium">
                {monetizationModel === 'content_unlock' ? 'Premium Post - Pay to Unlock' : 
                 monetizationModel === 'file_download' ? 'File Download - Pay to Access' : 
                 'Premium Content'}
              </span>
            </div>
            
            <input
              type="range"
              min="1000"
              max="20000"
              step="1000"
              value={postFee}
              onChange={(e) => setPostFee(parseInt(e.target.value))}
              className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer mb-1"
            />
            
            <div className="flex justify-between text-xs text-red-700">
              <span>1,000</span>
              <span className="font-medium">{postFee.toLocaleString()} UGX</span>
              <span>20,000</span>
            </div>
          </div>
        )}
        
        {enablePaidDMs && (
          <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center text-red-800 mb-1">
              <MessageSquare size={14} className="mr-1" />
              <span className="text-sm font-medium">Paid Direct Messaging</span>
            </div>
            
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={dmFee}
              onChange={(e) => setDmFee(parseInt(e.target.value))}
              className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer mb-1"
            />
            
            <div className="flex justify-between text-xs text-red-700">
              <span>1,000</span>
              <span className="font-medium">{dmFee.toLocaleString()} UGX</span>
              <span>10,000</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-800 text-xs rounded-lg flex items-center">
            <CircleAlert size={14} className="mr-1" />
            {error}
          </div>
        )}
        
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <div className="flex space-x-1 text-red-600">
            <button className="p-1.5 rounded-full hover:bg-red-50" onClick={() => fileInputRef.current.click()}>
              <Image size={16} />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
            </button>
            
            <button className="p-1.5 rounded-full hover:bg-red-50" onClick={() => setShowTopicSelector(!showTopicSelector)}>
              <BarChart2 size={16} />
            </button>
            
            <button 
              className={`p-1.5 rounded-full hover:bg-red-50 ${showMonetizationOptions && 'text-red-800 bg-red-50'}`}
              onClick={() => setShowMonetizationOptions(!showMonetizationOptions)}
            >
              <DollarSign size={16} />
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full text-sm flex items-center ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-800'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-white mr-1 rounded-full"></div>
                Posting...
              </>
            ) : (
              <>
                <Send size={14} className="mr-1" />
                Post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPost;