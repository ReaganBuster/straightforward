import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  postId,
  authorId,
  currentRating = 0,
  maxRating = 5,
  size = 20,
  onRate,
  readonly = false,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(currentRating);

  useEffect(() => {
    setSelectedRating(currentRating);
  }, [currentRating]);

  const handleRatingClick = rating => {
    if (readonly) return;

    setSelectedRating(rating);
    if (onRate) {
      onRate(postId, authorId, rating);
    }
  };

  return (
    <div className="flex">
      {[...Array(maxRating)].map((_, index) => {
        const ratingValue = index + 1;

        // Determine if this star should be filled
        const isFilled = (hoveredRating || selectedRating) >= ratingValue;

        return (
          <Star
            key={index}
            size={size}
            className={`cursor-${readonly ? 'default' : 'pointer'} transition-colors duration-150 ${
              isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            onClick={() => handleRatingClick(ratingValue)}
            onMouseEnter={() => !readonly && setHoveredRating(ratingValue)}
            onMouseLeave={() => !readonly && setHoveredRating(0)}
          />
        );
      })}
    </div>
  );
};

export default RatingStars;
