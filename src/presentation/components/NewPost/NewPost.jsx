import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  CircleAlert,
  ImagePlus,
  Trash2,
  Video,
  Music,
  FileText,
  Calendar,
  ShoppingBag,
  Images,
  Upload,
  Camera,
  Film,
  Mic
} from 'lucide-react';
import { PLACEHOLDER_PICTURE } from '@constants/constants';

const NewPost = ({ user, onPostCreated, onClose }) => {
  const [caption, setCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [contentType, setContentType] = useState('image');
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  
  const fileInputRef = useRef(null);

  const contentTypes = [
    { id: 'image', name: 'Images', icon: <ImagePlus size={16} />, accept: 'image/*', multiple: true },
    { id: 'video', name: 'Video', icon: <Video size={16} />, accept: 'video/*', multiple: false },
    // { id: 'audio', name: 'Audio', icon: <Music size={16} />, accept: 'audio/*', multiple: false },
    // { id: 'document', name: 'Document', icon: <FileText size={16} />, accept: '.pdf,.doc,.docx,.txt', multiple: false },
  ];

  const currentContentType = contentTypes.find(type => type.id === contentType);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = [];
    const maxSize = 50 * 1024 * 1024; // 50MB

    files.forEach(file => {
      if (file.size > maxSize) {
        setError(`File "${file.name}" is too large. Maximum size is 50MB.`);
        return;
      }
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          validFiles.push({
            file,
            preview: e.target.result,
            type: 'image',
            name: file.name,
            size: file.size
          });
          setSelectedFiles(prev => [...prev, ...validFiles]);
        };
        reader.readAsDataURL(file);
      } else {
        validFiles.push({
          file,
          preview: null,
          type: file.type.split('/')[0],
          name: file.name,
          size: file.size
        });
      }
    });

    if (validFiles.length > 0 && contentType !== 'image') {
      setSelectedFiles(validFiles);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Camera size={16} className="text-green-600" />;
      case 'video': return <Film size={16} className="text-blue-600" />;
      // case 'audio': return <Mic size={16} className="text-purple-600" />;
      // default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      setError('Please enter a caption for your post');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setError(null);
    setCreating(true);

    try {
      // Here you would implement the actual file upload logic
      // For now, we'll simulate the upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setCaption('');
      setSelectedFiles([]);
      setContentType('image');
      
      onPostCreated && onPostCreated();
      onClose && onClose();
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleDismiss = () => {
    setCaption('');
    setSelectedFiles([]);
    setContentType('image');
    setError(null);
    onClose && onClose();
  };

  return (
    <div className="bg-white rounded-lg p-4 max-w-2xl mx-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Create New Post</h2>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex items-start mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
          <img
            src={user?.avatar_url || PLACEHOLDER_PICTURE}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <textarea
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700 min-h-[80px] resize-none"
            maxLength={2000}
          />
          <div className="text-xs text-right text-gray-500 mt-1">
            {caption.length}/2000
          </div>
        </div>
      </div>

      {/* Content Type Selection */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2 text-gray-700">Media Type</div>
        <div className="flex flex-wrap gap-2">
          {contentTypes.map(type => (
            <button
              key={type.id}
              onClick={() => {
                setContentType(type.id);
                setSelectedFiles([]);
              }}
              className={`px-3 py-2 rounded-lg text-sm flex items-center transition ${
                contentType === type.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div className="mb-4">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
        >
          <Upload size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-1">
            Click to upload {currentContentType?.name.toLowerCase()} files
          </p>
          <p className="text-xs text-gray-500">
            {contentType === 'image' ? 'Support: JPG, PNG, GIF (Max 50MB each)' : 
             contentType === 'video' ? 'Support: MP4, MOV, AVI (Max 50MB)' :
             contentType === 'audio' ? 'Support: MP3, WAV, M4A (Max 50MB)' :
             'Support: PDF, DOC, DOCX, TXT (Max 50MB)'}
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={currentContentType?.accept}
          multiple={currentContentType?.multiple}
          className="hidden"
        />
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium mb-2 text-gray-700">
            Selected Files ({selectedFiles.length})
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((fileObj, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                {fileObj.preview ? (
                  <img
                    src={fileObj.preview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                    {getFileIcon(fileObj.type)}
                  </div>
                )}
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileObj.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileObj.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 p-1 ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded-lg flex items-center">
          <CircleAlert size={16} className="mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={handleDismiss}
          disabled={creating}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={creating || !caption.trim() || selectedFiles.length === 0}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm hover:from-red-700 hover:to-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {creating ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Posting...
            </>
          ) : (
            <>
              <Send size={16} className="mr-2" />
              Post
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NewPost;