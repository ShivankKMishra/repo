import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Search, User, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [location] = useLocation();
  
  // Try to use auth and handle it safely if not in an auth context
  let user = null;
  let logoutMutation: any = { mutate: () => {} };
  try {
    const auth = useAuth();
    user = auth.user;
    logoutMutation = auth.logoutMutation;
  } catch (error) {
    // silently handle the case where auth provider isn't available
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-cream shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="text-terracotta mr-2">
                <i className="fas fa-hands-helping text-3xl"></i>
              </div>
              <div>
                <h1 className="font-playfair text-terracotta text-2xl font-bold">KarigarConnect</h1>
                <p className="text-xs text-teal">Empowering Local Artisans</p>
              </div>
            </div>
          </Link>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex bg-white rounded-full border border-amber/50 px-4 py-2 w-1/3">
            <Input 
              type="text" 
              placeholder="Search for handicrafts, artisans..." 
              className="w-full focus:outline-none border-none bg-transparent shadow-none" 
            />
            <Button variant="ghost" size="icon" className="text-amber">
              <Search size={18} />
            </Button>
          </div>
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <span className={`hover:text-terracotta transition cursor-pointer ${location === '/' ? 'text-terracotta' : 'text-warmGray'}`}>
                Explore
              </span>
            </Link>
            <Link href="/artisans">
              <span className={`hover:text-terracotta transition cursor-pointer ${location === '/artisans' ? 'text-terracotta' : 'text-warmGray'}`}>
                Artisans
              </span>
            </Link>
            <Link href="/events">
              <span className={`hover:text-terracotta transition cursor-pointer ${location === '/events' ? 'text-terracotta' : 'text-warmGray'}`}>
                Events
              </span>
            </Link>
            <Link href="/community">
              <span className={`hover:text-terracotta transition cursor-pointer ${location === '/community' ? 'text-terracotta' : 'text-warmGray'}`}>
                Community
              </span>
            </Link>
            <Link href="/stories">
              <span className={`hover:text-terracotta transition cursor-pointer ${location === '/stories' ? 'text-terracotta' : 'text-warmGray'}`}>
                Stories
              </span>
            </Link>
          </nav>
          
          {/* Mobile Menu & Icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-warmGray hover:text-terracotta">
              <ShoppingBag size={20} />
            </Button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-sm">{user.username}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-warmGray hover:text-terracotta"
                  onClick={handleLogout}
                >
                  <User size={20} />
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" size="icon" className="text-warmGray hover:text-terracotta">
                  <User size={20} />
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-warmGray hover:text-terracotta"
              onClick={toggleMobileMenu}
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>
        
        {/* Search Bar - Mobile */}
        <div className="mt-2 md:hidden">
          <div className="flex bg-white rounded-full border border-amber/50 px-4 py-2">
            <Input 
              type="text" 
              placeholder="Search for handicrafts, artisans..." 
              className="w-full focus:outline-none border-none bg-transparent shadow-none" 
            />
            <Button variant="ghost" size="icon" className="text-amber">
              <Search size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="bg-cream border-t border-amber/20 py-2 px-4 md:hidden">
          <nav className="flex flex-col space-y-2">
            <Link href="/">
              <span className={`text-warmGray hover:text-terracotta py-2 px-4 rounded-lg hover:bg-cream transition cursor-pointer ${
                location === '/' ? 'text-terracotta bg-cream/50' : ''
              }`}>
                Explore
              </span>
            </Link>
            <Link href="/artisans">
              <span className={`text-warmGray hover:text-terracotta py-2 px-4 rounded-lg hover:bg-cream transition cursor-pointer ${
                location === '/artisans' ? 'text-terracotta bg-cream/50' : ''
              }`}>
                Artisans
              </span>
            </Link>
            <Link href="/events">
              <span className={`text-warmGray hover:text-terracotta py-2 px-4 rounded-lg hover:bg-cream transition cursor-pointer ${
                location === '/events' ? 'text-terracotta bg-cream/50' : ''
              }`}>
                Events
              </span>
            </Link>
            <Link href="/community">
              <span className={`text-warmGray hover:text-terracotta py-2 px-4 rounded-lg hover:bg-cream transition cursor-pointer ${
                location === '/community' ? 'text-terracotta bg-cream/50' : ''
              }`}>
                Community
              </span>
            </Link>
            <Link href="/stories">
              <span className={`text-warmGray hover:text-terracotta py-2 px-4 rounded-lg hover:bg-cream transition cursor-pointer ${
                location === '/stories' ? 'text-terracotta bg-cream/50' : ''
              }`}>
                Stories
              </span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
