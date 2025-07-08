import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  Share2,
} from 'lucide-react';

const ChatProductDisplay = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('Crimson Red');
  const [isLiked, setIsLiked] = useState(false);

  // Mock product data
  const product = {
    name: 'Aurora Wireless Headphones',
    brand: 'SoundWave Pro',
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviews: 2847,
    description:
      'Premium wireless headphones with active noise cancellation, 40-hour battery life, and studio-quality sound. Experience music like never before.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&h=400&fit=crop',
    ],
    variants: {
      colors: ['Crimson Red', 'Midnight Black', 'Pearl White', 'Ocean Blue'],
      sizes: ['Standard', 'Large'],
    },
    features: [
      'Active Noise Cancellation',
      '40H Battery',
      'Quick Charge',
      'Premium Audio',
    ],
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      prev => (prev - 1 + product.images.length) % product.images.length
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      {/* Chat Gap Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        <div className="px-4 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-200">
          SHARED PRODUCT
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform hover:scale-[1.02] transition-all duration-500">
        <div className="relative bg-gradient-to-br from-red-50 to-red-100 p-8">
          {/* Product Images Section */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Image */}
            <div className="lg:w-1/2">
              <div className="relative group">
                <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />

                  {/* Image Navigation */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Image Dots */}
                {product.images.length > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentImageIndex
                            ? 'bg-red-500 scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:w-1/2 space-y-6">
              {/* Brand & Name */}
              <div>
                <p className="text-red-600 font-semibold text-sm uppercase tracking-wide">
                  {product.brand}
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-700 font-medium">
                  {product.rating}
                </span>
                <span className="text-gray-500">
                  ({product.reviews.toLocaleString()} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ${product.price}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  % OFF
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>

              {/* Variants */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {product.variants.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedVariant(color)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedVariant === color
                            ? 'bg-red-500 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-red-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {product.features.map(feature => (
                  <span
                    key={feature}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

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
                <Eye size={20} />
              </button>
            </div>

            <div className="flex gap-3">
              <button className="px-8 py-3 bg-white text-red-600 border-2 border-red-500 rounded-full font-bold hover:bg-red-50 transition-all duration-200 transform hover:scale-105">
                View Details
              </button>
              <button className="px-8 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg">
                <ShoppingCart size={18} />
                Add to Cart
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

export default ChatProductDisplay;
