import React from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  onClick?: () => void;
}

export const ProductImage: React.FC<ProductImageProps> = ({ src, alt, onClick }) => {
  return (
    <div 
      className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 hover:opacity-90 transition-opacity duration-200 cursor-pointer"
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};