import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Star, StarHalf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type Artisan = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  profile?: {
    craft?: string;
    experience?: string;
    verified: boolean;
    skills?: string;
  };
};

interface ArtisanCardProps {
  artisan: Artisan;
}

const ArtisanCard = ({ artisan }: ArtisanCardProps) => {
  const fullName = [artisan.firstName, artisan.lastName].filter(Boolean).join(' ') || artisan.username;
  const skills = artisan.profile?.skills ? artisan.profile.skills.split(',') : [];
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      <div className="relative">
        <img 
          src={artisan.profilePicture || "https://images.unsplash.com/photo-1519058082700-08a0b56da9b4"} 
          alt={`Artisan ${fullName}`} 
          className="w-full h-48 object-cover" 
        />
        {artisan.profile?.verified && (
          <div className="absolute top-4 right-4 bg-amber text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <i className="fas fa-check-circle mr-1"></i> Verified
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-playfair text-xl font-bold text-warmGray">{fullName}</h3>
            {artisan.location && (
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="h-3 w-3 text-terracotta mr-1" />
                {artisan.location}
              </p>
            )}
          </div>
          <div className="flex text-amber">
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <StarHalf className="h-4 w-4 fill-current" />
          </div>
        </div>
        
        <p className="mt-3 text-warmGray/80 line-clamp-2">
          {artisan.bio || `${artisan.profile?.experience || 'Skilled artisan'} with expertise in ${artisan.profile?.craft || 'traditional crafts'}.`}
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline" className="bg-cream text-terracotta text-xs px-2 py-1 rounded-full">
              {skill.trim()}
            </Badge>
          ))}
        </div>
        
        <div className="mt-5 flex justify-between">
          <Link href={`/artisans/${artisan.id}`} className="text-teal font-medium hover:text-terracotta transition">
            View Profile
          </Link>
          <Link href={`/products/artisan/${artisan.id}`} className="text-teal font-medium hover:text-terracotta transition">
            Shop Crafts
          </Link>
        </div>
      </div>
    </div>
  );
};

const ArtisanSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-md">
    <Skeleton className="w-full h-48" />
    <div className="p-5">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-16 w-full mt-3" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-5 flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  </div>
);

export default function FeaturedArtisans() {
  const { data: artisans, isLoading } = useQuery<Artisan[]>({
    queryKey: ['/api/artisans'],
  });

  return (
    <section className="py-12 bg-cream">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-playfair text-3xl font-bold text-warmGray">Featured Artisans</h2>
          <Link href="/artisans" className="text-teal font-medium hover:text-terracotta transition">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading && (
            <>
              <ArtisanSkeleton />
              <ArtisanSkeleton />
              <ArtisanSkeleton />
            </>
          )}
          
          {artisans?.slice(0, 3).map((artisan) => (
            <ArtisanCard key={artisan.id} artisan={artisan} />
          ))}
          
          {artisans?.length === 0 && (
            <div className="col-span-3 text-center py-8">
              <p className="text-warmGray/80">No artisans available. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
