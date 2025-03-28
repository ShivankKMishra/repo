import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/categories/${category.id}`}>
      <div className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer">
        <img 
          src={category.imageUrl} 
          alt={category.name} 
          className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-terracotta/80 to-transparent flex items-end">
          <div className="p-4">
            <h3 className="font-playfair text-xl text-white font-semibold">{category.name}</h3>
          </div>
        </div>
      </div>
    </Link>
  );
};

const CategorySkeleton = () => (
  <div className="rounded-lg overflow-hidden shadow-lg">
    <Skeleton className="w-full h-48" />
    <div className="p-4 bg-terracotta/80">
      <Skeleton className="h-6 w-24" />
    </div>
  </div>
);

export default function FeaturedCategories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-playfair text-3xl font-bold text-warmGray text-center mb-8">
          Explore Craft Categories
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading && (
            <>
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
            </>
          )}
          
          {categories?.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/categories">
            <a className="text-teal font-medium hover:text-terracotta transition inline-flex items-center">
              View All Categories
              <ChevronRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
