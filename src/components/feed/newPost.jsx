import { useState, useRef, useEffect } from 'react';
import { 
  Lock, X, Send, CircleAlert, MessageSquare, 
  Unlock, ImagePlus, Trash2, Pencil, BarChart2
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useCreatePost, useProfile } from '../../hooks/hooks';

const NewPost = ({ user, onPostCreated, onClose }) => {
  const [caption, setCaption] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [contentType, setContentType] = useState('product');
  const [articleContent, setArticleContent] = useState('');
  const [articleTitle, setArticleTitle] = useState('');
  const [audioTracks, setAudioTracks] = useState([{ title: '', url: '' }]);
  const [audioTitle, setAudioTitle] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoURL, setVideoURL] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [isCaptionOnly, setIsCaptionOnly] = useState(false);
  const [monetizationModel, setMonetizationModel] = useState('free');
  const [contentPrice, setContentPrice] = useState(0);
  const [error, setError] = useState(null);
  const [customTopic, setCustomTopic] = useState('');
  const {profile} = useProfile(user.id)

  const multipleFileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const { create, creating } = useCreatePost();

  const getSuggestedTopics = () => {
    switch (contentType) {
      case 'text':
        return [
          'Writing', 'Education', 'Literature', 'Research', 'Publishing',
          'Journalism', 'Poetry', 'Essays', 'Fiction', 'Non-Fiction', 'Self-Help',
          'Philosophy', 'History', 'Science', 'Technology Trends'
        ];
      case 'audio':
        return [
          'Music', 'Podcast', 'Audio Books', 'Interviews', 'Sound Design',
          'Meditation', 'Storytelling', 'ASMR', 'Language Learning', 'Music Production',
          'Radio Drama', 'Voice Acting', 'Soundscapes', 'Educational Audio', 'Live Sessions'
        ];
      case 'video':
        return [
          'Film', 'Tutorials', 'Vlogging', 'Reviews', 'Cinematics',
          'Documentaries', 'Gaming', 'Cooking', 'Fitness', 'Travel Vlogs',
          'Animation', 'Interviews', 'Behind the Scenes', 'Live Streams', 'Educational Videos'
        ];
      case 'event':
        return [
          'Workshops', 'Conferences', 'Meetups', 'Seminars', 'Festivals',
          'Cinema Movie Tickets', 'Concerts', 'Theater Plays', 'Art Exhibitions',
          'Charity Events', 'Sports Matches', 'Webinars', 'Trade Shows', 'Book Launches', 'Cultural Festivals'
        ];
      case 'product':
        return [
          'Fashion', 'Electronics', 'Home', 'Beauty', 'Gadgets',
          'Clothing', 'Footwear', 'Jewelry', 'Watches', 'Accessories',
          'Furniture', 'Appliances', 'Kitchenware', 'Sports Equipment', 'Toys',
          'Books', 'Health Supplements', 'Pet Supplies', 'Automotive Parts', 'Outdoor Gear'
        ];
      case 'gallery':
        return [
          'Photography', 'Art', 'Exhibits', 'Travel', 'Nature',
          'Portraits', 'Street Photography', 'Abstract Art', 'Wildlife', 'Architecture',
          'Fashion Photography', 'Food Photography', 'Landscape', 'Macro', 'Digital Art'
        ];
      default:
        return [];
    }
  };

  const monetizationModels = [
    {
      id: 'free',
      name: 'Free Access',
      icon: <Unlock size={14} />,
      category: 'none'
    },
    {
      id: 'paid',
      name: 'Paid Access',
      icon: <MessageSquare size={14} />,
      category: 'messaging'
    }
  ];

  const contentTypes = [
    { id: 'text', name: 'Text Article' },
    { id: 'audio', name: 'Audio Content' },
    { id: 'video', name: 'Video Content' },
    { id: 'event', name: 'Event' },
    { id: 'product', name: 'Product' },
    { id: 'gallery', name: 'Image Gallery' }
  ];

  useEffect(() => {
    if (isCaptionOnly || !monetizationModel || monetizationModel === 'free') {
      setIsPremium(false);
      return;
    }
    if (monetizationModel === 'paid') {
      setIsPremium(true);
    }
  }, [monetizationModel, isCaptionOnly]);

  useEffect(() => {
    if (isCaptionOnly) {
      setContentType('text');
      setMonetizationModel('free');
      setIsPremium(false);
      setContentPrice(0);
      setProductPrice(0);
      setArticleContent('');
      setArticleTitle('');
      setAudioTracks([{ title: '', url: '' }]);
      setAudioTitle('');
      setVideoTitle('');
      setVideoURL('');
      setEventTitle('');
      setEventDate('');
      setEventLocation('');
      setProductTitle('');
      setProductImages([]);
      setProductVariants([]);
      setGalleryTitle('');
      setGalleryImages([]);
    }
  }, [isCaptionOnly]);

  // Sync productPrice and contentPrice when contentType is 'product'
  useEffect(() => {
    if (contentType === 'product') {
      setContentPrice(productPrice);
    }
  }, [productPrice, contentType]);

  useEffect(() => {
    if (contentType === 'product') {
      setProductPrice(contentPrice);
    }
  }, [contentPrice, contentType]);

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

  const handleMultipleImagesSelect = (e, target) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      setError('Please select only image files');
      return;
    }
    const newImages = imageFiles.map(file => {
      const reader = new FileReader();
      let preview = '';
      reader.onloadend = () => {
        preview = reader.result;
        if (target === 'product') {
          setProductImages(prev => [...prev, { file, preview }]);
        } else {
          setGalleryImages(prev => [...prev, { file, preview, caption: '' }]);
        }
      };
      reader.readAsDataURL(file);
      return { file, preview };
    });
    if (target === 'product') {
      setProductImages(prev => [...prev, ...newImages]);
    } else {
      setGalleryImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index, target) => {
    const newImages = target === 'product' ? [...productImages] : [...galleryImages];
    newImages.splice(index, 1);
    target === 'product' ? setProductImages(newImages) : setGalleryImages(newImages);
  };

  const updateImageCaption = (index, caption, target) => {
    const newImages = target === 'product' ? [...productImages] : [...galleryImages];
    newImages[index].caption = caption;
    target === 'product' ? setProductImages(newImages) : setGalleryImages(newImages);
  };

  const addAudioTrack = () => {
    setAudioTracks([...audioTracks, { title: '', url: '' }]);
  };

  const removeAudioTrack = (index) => {
    const newTracks = [...audioTracks];
    newTracks.splice(index, 1);
    setAudioTracks(newTracks);
  };

  const updateAudioTrack = (index, field, value) => {
    const newTracks = [...audioTracks];
    newTracks[index][field] = value;
    setAudioTracks(newTracks);
  };

  const addProductVariant = () => {
    setProductVariants(prev => [...prev, { name: '', value: '' }]);
  };

  const removeProductVariant = (index) => {
    const newVariants = [...productVariants];
    newVariants.splice(index, 1);
    setProductVariants(newVariants);
  };

  const updateProductVariant = (index, field, value) => {
    const newVariants = [...productVariants];
    newVariants[index][field] = value;
    setProductVariants(newVariants);
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

  const handleCustomTopic = (e) => {
    if (e.key === 'Enter' && customTopic.trim()) {
      handleTopicToggle(customTopic.trim());
      setCustomTopic('');
    }
  };

  const resetForm = () => {
    setCaption('');
    setIsPremium(false);
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedTopics([]);
    setMonetizationModel('free');
    setContentPrice(0);
    setProductPrice(0);
    setContentType('product');
    setArticleContent('');
    setArticleTitle('');
    setAudioTracks([{ title: '', url: '' }]);
    setAudioTitle('');
    setVideoTitle('');
    setVideoURL('');
    setEventTitle('');
    setEventDate('');
    setEventLocation('');
    setProductTitle('');
    setProductImages([]);
    setProductVariants([]);
    setGalleryTitle('');
    setGalleryImages([]);
    setIsCaptionOnly(false);
    setError(null);
    setCustomTopic('');
  };

  const handleDismiss = () => {
    resetForm();
    onClose && onClose();
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      setError('Please enter a caption for your post');
      return;
    }

    if (!isCaptionOnly) {
      switch(contentType) {
        case 'text':
          if (!articleContent.trim()) {
            setError('Please enter article content');
            return;
          }
          break;
        case 'audio':
          if (audioTracks.length === 0 || !audioTracks[0].title) {
            setError('Please add at least one audio track');
            return;
          }
          break;
        case 'video':
          if (!videoURL) {
            setError('Please enter a video URL');
            return;
          }
          break;
        case 'event':
          if (!eventTitle || !eventDate || !eventLocation) {
            setError('Please fill in all required event details');
            return;
          }
          break;
        case 'product':
          if (!productTitle || productPrice < 0) {
            setError('Please enter product title and valid price');
            return;
          }
          break;
        case 'gallery':
          if (galleryImages.length === 0) {
            setError('Please add at least one image to your gallery');
            return;
          }
          break;
        default:
          setError('Invalid content type');
          return;
      }
    }

    if (selectedTopics.length === 0) {
      setError('Please select at least one topic');
      return;
    }

    setError(null);

    try {
      let imageUrl = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.user_id}-${Date.now()}.${fileExt}`;
        const filePath = `post-images/${fileName}`;
        const uploadResponse = await supabase.storage
          .from('media')
          .upload(filePath, selectedImage);
        if (uploadResponse.error) throw uploadResponse.error;
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      let productImageUrls = [];
      if (contentType === 'product' && productImages.length > 0) {
        for (let i = 0; i < productImages.length; i++) {
          const image = productImages[i];
          if (image.file) {
            const fileExt = image.file.name.split('.').pop();
            const fileName = `${user.user_id}-product-${Date.now()}-${i}.${fileExt}`;
            const filePath = `product-images/${fileName}`;
            const uploadResponse = await supabase.storage
              .from('media')
              .upload(filePath, image.file);
            if (uploadResponse.error) throw uploadResponse.error;
            const { data: urlData } = supabase.storage
              .from('media')
              .getPublicUrl(filePath);
            productImageUrls.push({
              url: urlData.publicUrl
            });
          }
        }
      }

      let galleryUrls = [];
      if (contentType === 'gallery' && galleryImages.length > 0) {
        for (let i = 0; i < galleryImages.length; i++) {
          const image = galleryImages[i];
          const fileExt = image.file.name.split('.').pop();
          const fileName = `${user.user_id}-gallery-${Date.now()}-${i}.${fileExt}`;
          const filePath = `gallery-images/${fileName}`;
          const galleryUploadResponse = await supabase.storage
            .from('media')
            .upload(filePath, image.file);
          if (galleryUploadResponse.error) throw galleryUploadResponse.error;
          const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);
          galleryUrls.push({
            url: urlData.publicUrl,
            caption: image.caption || ''
          });
        }
      }

      const postData = await create(
        user.user_id,
        caption,
        imageUrl,
        isPremium,
        selectedTopics,
        isCaptionOnly ? null : (monetizationModel === 'free' ? null : monetizationModel),
        isCaptionOnly ? null : contentPrice,
        false,
        !isCaptionOnly ? contentType : undefined,
        !isCaptionOnly && contentType === 'text' ? articleTitle : undefined,
        !isCaptionOnly && contentType === 'text' ? (caption.substring(0, 100) + (caption.length > 100 ? '...' : '')) : undefined,
        !isCaptionOnly && contentType === 'text' ? articleContent : undefined,
        !isCaptionOnly && contentType === 'text' ? Math.ceil(articleContent.length / 2000) : undefined,
        !isCaptionOnly && contentType === 'text' ? 'text' : undefined,
        undefined,
        !isCaptionOnly && contentType === 'audio' ? audioTitle : undefined,
        !isCaptionOnly && contentType === 'audio' ? JSON.stringify(audioTracks) : undefined,
        !isCaptionOnly && contentType === 'video' ? videoTitle : undefined,
        !isCaptionOnly && contentType === 'video' ? imageUrl : undefined,
        !isCaptionOnly && contentType === 'video' ? videoURL : undefined,
        undefined,
        !isCaptionOnly && contentType === 'event' ? eventTitle : undefined,
        !isCaptionOnly && contentType === 'event' ? eventDate : undefined,
        undefined,
        !isCaptionOnly && contentType === 'event' ? eventLocation : undefined,
        !isCaptionOnly && contentType === 'product' ? productTitle : undefined,
        !isCaptionOnly && contentType === 'product' ? productPrice : undefined,
        !isCaptionOnly && contentType === 'product' ? imageUrl : undefined,
        !isCaptionOnly && contentType === 'product' ? JSON.stringify(productImageUrls) : undefined,
        !isCaptionOnly && contentType === 'product' ? JSON.stringify(productVariants) : undefined,
        !isCaptionOnly && contentType === 'gallery' ? galleryTitle : undefined,
        !isCaptionOnly && contentType === 'gallery' ? galleryUrls.length : undefined,
        !isCaptionOnly && contentType === 'gallery' ? JSON.stringify(galleryUrls) : undefined,
        isPremium
      );

      resetForm();
      onPostCreated && onPostCreated(postData);
      onClose && onClose();
    } catch (err) {
      setError(err.message || 'Failed to create post');
    }
  };

  const renderContentEditor = () => {
    switch (contentType) {
      case 'text':
        return (
          <>
            <input
              type="text"
              placeholder="Enter article title..."
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 mb-2"
            />
            <textarea
              placeholder="Enter your full content here..."
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 min-h-32 resize-none"
            />
            <div className="text-xs text-right text-gray-500">{articleContent.length} characters</div>
          </>
        );
      case 'audio':
        return (
          <>
            <input
              type="text"
              placeholder="Enter audio title..."
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 mb-2"
            />
            {audioTracks.map((track, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Track title"
                  value={track.title}
                  onChange={(e) => updateAudioTrack(index, 'title', e.target.value)}
                  className="flex-1 p-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Track URL"
                  value={track.url}
                  onChange={(e) => updateAudioTrack(index, 'url', e.target.value)}
                  className="flex-1 p-2 border border-gray-200 rounded-lg"
                />
                <button onClick={() => removeAudioTrack(index)} className="text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={addAudioTrack} className="text-red-600 text-xs">
              Add Track
            </button>
          </>
        );
      case 'video':
        return (
          <>
            <input
              type="text"
              placeholder="Enter video title..."
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 mb-2"
            />
            <input
              type="text"
              placeholder="Enter video URL..."
              value={videoURL}
              onChange={(e) => setVideoURL(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 mb-2"
            />
          </>
        );
      case 'event':
        return (
          <>
            <input
              type="text"
              placeholder="Enter event title..."
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 mb-2"
            />
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 mb-2"
            />
            <input
              type="text"
              placeholder="Enter event location..."
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700"
            />
          </>
        );
      case 'product':
        return (
          <>
            <input
              type="text"
              placeholder="Enter product title..."
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 mb-2"
            />
            <div className="flex items-center mb-2">
              <label className="text-sm font-medium text-gray-700 mr-2">Product Price</label>
              <input
                type="number"
                placeholder="Enter product price..."
                value={productPrice}
                onChange={(e) => {
                  const newPrice = isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value);
                  setProductPrice(newPrice);
                  setContentPrice(newPrice); // Sync with contentPrice
                }}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700"
              />
              <span className="ml-2 text-xs text-gray-700">UGX</span>
            </div>
            <div className="mb-2">
              <div className="text-sm font-medium mb-1 text-gray-700">Product Images</div>
              <button
                onClick={() => multipleFileInputRef.current.click()}
                className="text-red-600 text-xs flex items-center"
              >
                <ImagePlus size={16} className="mr-1" /> Add Product Images
              </button>
              <input
                type="file"
                ref={multipleFileInputRef}
                onChange={(e) => handleMultipleImagesSelect(e, 'product')}
                accept="image/*"
                multiple
                className="hidden"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {productImages.map((image, index) => image.preview && (
                  <div key={index} className="relative">
                    <img 
                      src={image.preview} 
                      alt="Product" 
                      className="w-16 h-16 object-cover rounded border border-gray-200" 
                    />
                    <button 
                      onClick={() => removeImage(index, 'product')} 
                      className="absolute top-0 right-0 bg-gray-800 bg-opacity-60 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <div className="text-sm font-medium mb-1 text-gray-700">Product Variants (e.g., Size, Color)</div>
              {productVariants.map((variant, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Variant name (e.g., Size)"
                    value={variant.name}
                    onChange={(e) => updateProductVariant(index, 'name', e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700"
                  />
                  <input
                    type="text"
                    placeholder="Variant value (e.g., Medium)"
                    value={variant.value}
                    onChange={(e) => updateProductVariant(index, 'value', e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700"
                  />
                  <button onClick={() => removeProductVariant(index)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={addProductVariant} className="text-red-600 text-xs">
                Add Variant
              </button>
            </div>
          </>
        );
      case 'gallery':
        return (
          <>
            <input
              type="text"
              placeholder="Enter gallery title..."
              value={galleryTitle}
              onChange={(e) => setGalleryTitle(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 mb-2"
            />
            <button
              onClick={() => multipleFileInputRef.current.click()}
              className="text-red-600 text-xs mb-2 flex items-center"
            >
              <ImagePlus size={16} className="mr-1" /> Add Gallery Images
            </button>
            <input
              type="file"
              ref={multipleFileInputRef}
              onChange={(e) => handleMultipleImagesSelect(e, 'gallery')}
              accept="image/*"
              multiple
              className="hidden"
            />
            {galleryImages.map((image, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <img src={image.preview} alt="Gallery" className="w-16 h-16 object-cover rounded" />
                <input
                  type="text"
                  placeholder="Image caption"
                  value={image.caption}
                  onChange={(e) => updateImageCaption(index, e.target.value, 'gallery')}
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700"
                />
                <button onClick={() => removeImage(index, 'gallery')} className="text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </>
        );
      default:
        return <div className="text-red-600 text-xs">Unsupported content type</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg p-3">
      <div className="flex mb-3">
        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
          <img 
            src={profile?.avatar_url || 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.warn('Failed to load profile image in NewPost, using fallback');
              e.target.src = 'https://via.placeholder.com/32';
            }}
          />
        </div>
        <div className="flex-1">
          <textarea
            placeholder="Write a caption or teaser for your post..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 min-h-20 resize-none"
            maxLength={1000}
          />
          <div className="text-xs text-right text-gray-500">{caption.length}/1000</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm font-medium mb-1 text-gray-700">Post Thumbnail</div>
        {imagePreview ? (
          <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-200">
            <img src={imagePreview} alt="Thumbnail" className="w-full max-h-56 object-contain" />
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
        ) : (
          <button
            onClick={() => thumbnailInputRef.current.click()}
            className="text-red-600 text-xs mb-2 flex items-center"
          >
            <ImagePlus size={16} className="mr-1" /> Add Post Thumbnail (Recommended for Visibility)
          </button>
        )}
        <input
          type="file"
          ref={thumbnailInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="mb-3">
        <button
          onClick={() => setIsCaptionOnly(!isCaptionOnly)}
          className={`flex items-center text-xs px-3 py-1 rounded-full transition ${
            isCaptionOnly
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          <Pencil size={14} className="mr-1" />
          {isCaptionOnly ? 'Add Content Details' : 'Caption Only'}
        </button>
      </div>
      
      {!isCaptionOnly && (
        <>
          <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium mb-2 text-gray-700">Content Type</div>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 text-xs"
            >
              {contentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <div className="text-sm font-medium mb-1 text-gray-700">Full Content</div>
            {renderContentEditor()}
          </div>

          <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium mb-2 text-gray-700">Access Options</div>
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>

          {/* Show Set Price section only for non-product content types */}
          {contentType !== 'product' && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center text-gray-700 mb-2">
                <span className="text-sm font-medium mr-1">Set Price</span>
                <span className="text-xs text-gray-500">(Optional for all content)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={contentPrice}
                  onChange={(e) => {
                    const newPrice = isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value);
                    setContentPrice(newPrice);
                    if (contentType === 'product') setProductPrice(newPrice); // Sync with productPrice
                  }}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 text-xs"
                  placeholder="Enter price in UGX"
                />
                <span className="text-xs text-gray-700">UGX</span>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="mb-3">
        <div className="text-sm font-medium mb-1 text-gray-700">Topics (Required)</div>
        <input
          type="text"
          placeholder="Enter custom topic and press Enter..."
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          onKeyPress={handleCustomTopic}
          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-700 text-xs mb-2"
        />
        <div className="flex flex-wrap gap-2">
          {getSuggestedTopics().map(topic => (
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
      
      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-800 text-xs rounded-lg flex items-center">
          <CircleAlert size={14} className="mr-1" />
          {error}
        </div>
      )}
      
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            disabled={creating}
            className={`bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center ${
              creating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-300'
            }`}
          >
            <X size={14} className="mr-1" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={creating}
            className={`bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full text-sm flex items-center ${
              creating ? 'opacity-70 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-800'
            }`}
          >
            {creating ? (
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