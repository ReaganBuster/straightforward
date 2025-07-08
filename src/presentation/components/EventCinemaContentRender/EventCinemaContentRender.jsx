import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Heart,
  Users,
  Ticket,
  Share2,
  Play,
  Volume2,
} from 'lucide-react';

const ChatEventDisplay = () => {
  const [selectedShowtime, setSelectedShowtime] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState(2);
  const [isLiked, setIsLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  // Mock event data
  const event = {
    title: 'Dune: Part Three',
    subtitle: 'The Epic Conclusion',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    rating: 'PG-13',
    duration: '2h 46min',
    releaseDate: '2025-11-15',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Oscar Isaac', 'Rebecca Ferguson'],
    poster:
      'https://images.unsplash.com/photo-1489599988932-59623d8e8c2f?w=600&h=900&fit=crop',
    backdrop:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=600&fit=crop',
    trailerThumb:
      'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=300&h=200&fit=crop',
    imdbRating: 8.9,
    synopsis:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.',
    cinema: {
      name: 'Cineplex Grand Theater',
      location: 'Downtown Plaza, 3rd Floor',
      distance: '2.3 km away',
    },
    showtimes: [
      { time: '2:30 PM', type: 'Standard', price: 15.99, available: 89 },
      { time: '6:15 PM', type: 'IMAX', price: 22.99, available: 156 },
      { time: '9:45 PM', type: '4DX', price: 28.99, available: 43 },
      { time: '11:30 PM', type: 'Standard', price: 12.99, available: 67 },
    ],
    features: ['IMAX', 'Dolby Atmos', '4DX', 'Recliner Seats'],
  };

  const selectedShow = event.showtimes[selectedShowtime];

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
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
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Hero Section with Backdrop */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={event.backdrop}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Movie Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-start gap-6">
              {/* Movie Poster */}
              <div className="relative group cursor-pointer flex-shrink-0">
                <img
                  src={event.poster}
                  alt={event.title}
                  className="w-32 h-48 object-cover rounded-xl shadow-2xl transform group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                  <Play size={32} className="text-white" />
                </div>
              </div>

              {/* Movie Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-4xl font-bold mb-1">{event.title}</h1>
                  <p className="text-xl text-red-300 font-medium">
                    {event.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-red-600 px-2 py-1 rounded text-white font-bold">
                    {event.rating}
                  </span>
                  <span>{event.duration}</span>
                  <div className="flex items-center gap-1">
                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="font-bold">{event.imdbRating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {event.genre.map(g => (
                    <span
                      key={g}
                      className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <p className="text-gray-200 text-sm leading-relaxed max-w-2xl">
                  {event.synopsis}
                </p>
              </div>
            </div>
          </div>

          {/* Trailer Button */}
          <button
            onClick={() => setShowTrailer(!showTrailer)}
            className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
          >
            <Play size={16} />
            Watch Trailer
          </button>
        </div>

        {/* Cinema Info */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 px-8 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MapPin size={20} className="text-red-600" />
              <div>
                <h3 className="font-bold text-gray-900">{event.cinema.name}</h3>
                <p className="text-sm text-gray-600">
                  {event.cinema.location} • {event.cinema.distance}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Today</p>
              <p className="font-bold text-gray-900">June 4, 2025</p>
            </div>
          </div>
        </div>

        {/* Showtimes Section */}
        <div className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-red-600" />
            Select Showtime
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {event.showtimes.map((show, index) => (
              <button
                key={index}
                onClick={() => setSelectedShowtime(index)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                  selectedShowtime === index
                    ? 'border-red-500 bg-red-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-red-300'
                }`}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {show.time}
                  </p>
                  <p className="text-sm text-red-600 font-semibold mt-1">
                    {show.type}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    ${show.price}
                  </p>
                  <p className="text-xs text-gray-500">
                    {show.available} seats left
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Seat Selection */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <Users size={20} className="text-red-600" />
              <span className="font-semibold text-gray-900">
                Number of tickets:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setSelectedSeats(Math.max(1, selectedSeats - 1))
                  }
                  className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-red-500 transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold">
                  {selectedSeats}
                </span>
                <button
                  onClick={() =>
                    setSelectedSeats(Math.min(8, selectedSeats + 1))
                  }
                  className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-red-500 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(selectedShow.price * selectedSeats).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-6">
            {event.features.map(feature => (
              <span
                key={feature}
                className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-gray-50 px-8 py-6 border-t">
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
                View Seats
              </button>
              <button className="px-8 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg">
                <Ticket size={18} />
                Book Tickets
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
