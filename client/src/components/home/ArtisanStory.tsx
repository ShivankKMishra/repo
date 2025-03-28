import { Link } from 'wouter';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function ArtisanStory() {
  return (
    <section className="py-12 bg-cream">
      <div className="container mx-auto px-4">
        <h2 className="font-playfair text-3xl font-bold text-warmGray text-center mb-2">
          Artisan Stories
        </h2>
        <p className="text-center text-warmGray/80 mb-8 max-w-2xl mx-auto">
          Discover the rich traditions and personal journeys behind India's finest handicrafts.
        </p>
        
        <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-10">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1604448252427-3dab47295e80?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Artisan working on pottery wheel" 
                className="w-full h-64 md:h-full object-cover" 
              />
            </div>
            
            <div className="md:w-1/2 p-6 md:p-8">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" 
                  alt="Rahul Kumar" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber" 
                />
                <div className="ml-4">
                  <h3 className="font-playfair text-xl font-bold text-warmGray">Rahul Kumar</h3>
                  <p className="text-sm text-gray-600">Master Potter, Jaipur</p>
                </div>
              </div>
              
              <h3 className="font-dancing text-3xl text-terracotta mb-4">
                Keeping the Blue Pottery Tradition Alive
              </h3>
              
              <p className="text-warmGray/80 mb-4">
                "My journey as a potter began 20 years ago when I learned this craft from my father. The distinctive blue pottery of Jaipur is not just a craft—it's our heritage that dates back to the Mughal era. Each piece tells a story of our cultural identity."
              </p>
              
              <p className="text-warmGray/80 mb-6">
                "Today, I'm training young artisans to preserve this ancient art while introducing contemporary designs that appeal to modern homes. Every pot we create carries centuries of tradition mixed with innovation."
              </p>
              
              <div className="flex space-x-4">
                <Link href="/stories/rahul-kumar">
                  <a className="text-teal font-medium hover:text-terracotta transition flex items-center">
                    Read Full Story
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Link>
                <Link href="/products/artisan/1">
                  <a className="text-teal font-medium hover:text-terracotta transition flex items-center">
                    Shop Rahul's Crafts
                    <ShoppingBag className="ml-2 h-4 w-4" />
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/stories">
            <a className="inline-block bg-terracotta text-white font-medium px-6 py-3 rounded-full hover:bg-amber transition duration-300">
              Explore More Stories
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
