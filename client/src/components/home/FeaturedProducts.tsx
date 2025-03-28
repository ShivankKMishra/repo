import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, StarHalf, Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition border border-gray-100">
      <Link href={`/products/${product.id}`}>
        <div className="relative cursor-pointer">
          <img 
            src={product.imageUrl || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38"} 
            alt={product.name} 
            className="w-full h-40 md:h-48 object-cover" 
          />
          <button 
            className={`absolute top-3 right-3 bg-white/80 hover:bg-white p-1.5 rounded-full ${isFavorite ? 'text-amber' : 'text-warmGray'}`}
            onClick={toggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>
      
      <div className="p-3 md:p-4">
        <div className="flex items-center space-x-1 text-amber mb-1">
          <Star className="h-3 w-3 fill-current" />
          <Star className="h-3 w-3 fill-current" />
          <Star className="h-3 w-3 fill-current" />
          <Star className="h-3 w-3 fill-current" />
          <StarHalf className="h-3 w-3 fill-current" />
          <span className="text-xs text-warmGray ml-1">(42)</span>
        </div>
        
        <h3 className="font-medium text-warmGray truncate">{product.name}</h3>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-terracotta font-medium">₹{product.price.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500">By Artisan</p>
        </div>
        
        <div className="mt-3">
          <Button className="w-full bg-teal hover:bg-terracotta text-white py-2 rounded-md transition duration-300 text-sm h-auto">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100">
    <Skeleton className="w-full h-40 md:h-48" />
    <div className="p-3 md:p-4">
      <Skeleton className="h-4 w-24 mb-1" />
      <Skeleton className="h-5 w-full mb-1" />
      <div className="flex justify-between mt-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  </div>
);

export default function FeaturedProducts() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-playfair text-3xl font-bold text-warmGray">Handcrafted Treasures</h2>
          <Link href="/products" className="text-teal font-medium hover:text-terracotta transition">
            View All Products
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading && (
            <>
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
            </>
          )}
          
          {products?.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          
          {products?.length === 0 && (
            <div className="col-span-4 text-center py-8">
              <p className="text-warmGray/80">No products available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
