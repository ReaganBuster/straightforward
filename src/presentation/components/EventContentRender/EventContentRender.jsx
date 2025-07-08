import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Share2,
  Ticket,
  Copy,
  Check,
  Navigation,
} from 'lucide-react';

const ChatEventDisplay = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Mock event data based on your database schema
  const event = {
    event_title: "Sarah & Michael's Wedding",
    event_date: '2025-07-15',
    event_time: '4:00 PM - 11:00 PM',
    event_location: 'Garden Paradise Resort, Lake Victoria Shores, Kampala',
    event_confirmation_code: 'WED-2025-SM847',
  };

  const copyConfirmationCode = () => {
    navigator.clipboard.writeText(event.event_confirmation_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEventTypeFromTitle = title => {
    const lower = title.toLowerCase();
    if (lower.includes('wedding'))
      return { type: 'Wedding', emoji: '💒', color: 'pink' };
    if (lower.includes('concert') || lower.includes('music'))
      return { type: 'Concert', emoji: '🎵', color: 'purple' };
    if (lower.includes('birthday') || lower.includes('party'))
      return { type: 'Party', emoji: '🎉', color: 'blue' };
    if (lower.includes('conference') || lower.includes('meeting'))
      return { type: 'Conference', emoji: '🎯', color: 'green' };
    if (lower.includes('graduation'))
      return { type: 'Graduation', emoji: '🎓', color: 'indigo' };
    return { type: 'Event', emoji: '📅', color: 'red' };
  };

  const eventMeta = getEventTypeFromTitle(event.event_title);

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      {/* Chat Gap Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        <div className="px-4 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-200 flex items-center gap-2">
          <Calendar size={12} />
          SHARED EVENT
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Main Event Card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition-all duration-500">
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-red-50 via-red-100 to-orange-50 p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-200/30 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-200/30 to-transparent rounded-tr-full"></div>

          <div className="relative">
            {/* Event Type Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{eventMeta.emoji}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-${eventMeta.color}-100 text-${eventMeta.color}-800`}
              >
                {eventMeta.type}
              </span>
            </div>

            {/* Event Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {event.event_title}
            </h1>

            {/* Event Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/70 backdrop-blur rounded-xl border border-white/50">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Date
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/70 backdrop-blur rounded-xl border border-white/50">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Time
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.event_time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 p-4 bg-white/70 backdrop-blur rounded-xl border border-white/50">
                <div className="p-2 bg-red-500 rounded-lg">
                  <MapPin size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-lg font-bold text-gray-900 leading-relaxed">
                    {event.event_location}
                  </p>
                  <button className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 transition-colors">
                    <Navigation size={14} />
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Code Section */}
        {event.event_confirmation_code && (
          <div className="bg-gray-50 px-8 py-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
                  Confirmation Code
                </p>
                <p className="text-xl font-mono font-bold text-gray-900 tracking-wider">
                  {event.event_confirmation_code}
                </p>
              </div>
              <button
                onClick={copyConfirmationCode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  codeCopied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {codeCopied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-gray-50 px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isLiked
                    ? 'bg-red-500 text-white scale-110'
                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                }`}
              >
                <Heart size={20} className={isLiked ? 'fill-current' : ''} />
              </button>
              <button className="p-3 bg-white text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200">
                <Share2 size={20} />
              </button>
              <button className="p-3 bg-white text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200">
                <Calendar size={20} />
              </button>
            </div>

            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white text-red-600 border-2 border-red-500 rounded-full font-bold hover:bg-red-50 transition-all duration-200 transform hover:scale-105">
                View Details
              </button>
              <button className="px-8 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg">
                <Ticket size={18} />
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Gap Indicator Bottom */}
      <div className="flex items-center justify-center mt-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        <div className="px-4 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
          Continue conversation below
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>
    </div>
  );
};

export default ChatEventDisplay;
