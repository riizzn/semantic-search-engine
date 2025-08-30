import React from 'react'
import { Product } from '../types';
import Image from 'next/image';
import Link from "next/link"
type ProductCardProps={
    product:Product;
}
export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <Link href={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <Image
            src={product.image || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        {/* Stock Status Badge */}
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Out of stock
          </div>
        )}

        {/* Product Details */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mt-1 flex items-center text-gray-900">
            <div className="flex">{product.rating}</div>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Colors */}
          <div className="mt-2">
            <p className="text-xs text-gray-500">Colors:</p>
            <div className="flex space-x-1 mt-1">
              {product.colors.map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: color.split("/")[0] }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}