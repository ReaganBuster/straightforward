import React from 'react';
import { FileText, Music, BookOpen, Download } from 'lucide-react';



export default function RenderContentCard(message, recipientName) {
  const isRecipient = !message.is_current_user;
  const baseStyles = `max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${
    isRecipient ? 'bg-white text-gray-900' : 'bg-red-500 text-white'
  }`;

  if (!message.content_type || message.content_type === 'text') {
    return (
      <div className={baseStyles}>
        {message.replyTo && (
          <div className="flex mb-1">
            <div className="w-1 bg-gray-300 rounded-full mr-2"></div>
            <div className="text-xs text-gray-500 truncate">
              <span className="font-medium">
                {isRecipient ? recipientName : 'You'}:{' '}
              </span>
              {message.replyTo.preview || 'Replied to message'}
            </div>
          </div>
        )}
        <div>{message.content || 'No content available'}</div>
      </div>
    );
  }

  switch (message.content_type) {
    case 'article':
      return (
        <div className={`${baseStyles} bg-white text-gray-900`}>
          <div className="border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <FileText size={16} className="text-red-500" />
              <span className="ml-2 font-medium">
                {message.article_title || 'Untitled Article'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">
                {message.article_pages || 0} pages
              </span>
              <button className="p-1 rounded hover:bg-gray-100">
                <Download size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="mt-2">
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center mb-2">
              <BookOpen size={24} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-700 mb-2">
              {message.article_preview || 'No preview available'}
            </p>
            <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm">
              Read Full Report
            </button>
          </div>
        </div>
      );
    case 'audio':
      return (
        <div className={`${baseStyles} bg-white text-gray-900`}>
          <div className="border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <Music size={16} className="text-red-500" />
              <span className="ml-2 font-medium">
                {message.audio_title || 'Untitled Audio'}
              </span>
            </div>
            <button className="p-1 rounded hover:bg-gray-100">
              <Download size={16} className="text-gray-500" />
            </button>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              No tracks available (stubbed)
            </p>
          </div>
        </div>
      );
    default:
      return (
        <div className={baseStyles}>
          <p className="text-xs text-gray-500">
            Unsupported content type: {message.content_type}
          </p>
          <div>{message.content || 'No content available'}</div>
        </div>
      );
  }
}
