import { Link } from 'wouter';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Heart
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-warmGray text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="text-amber mr-2">
                <Heart className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-playfair text-xl font-bold">KarigarConnect</h3>
                <p className="text-xs text-white/70">Empowering Local Artisans</p>
              </div>
            </div>
            
            <p className="text-white/70 mb-4">Bridging the gap between skilled artisans and conscious consumers, preserving India's rich craft heritage.</p>
            
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-amber transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-amber transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-amber transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-amber transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-playfair text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link href="/products" className="hover:text-amber transition">Browse Crafts</Link></li>
              <li><Link href="/artisans" className="hover:text-amber transition">Meet Artisans</Link></li>
              <li><Link href="/events" className="hover:text-amber transition">Upcoming Events</Link></li>
              <li><Link href="/community" className="hover:text-amber transition">Community Forum</Link></li>
              <li><Link href="/stories" className="hover:text-amber transition">Artisan Stories</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-playfair text-lg font-bold mb-4">For Artisans</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link href="/join-as-artisan" className="hover:text-amber transition">Join as an Artisan</Link></li>
              <li><Link href="/dashboard" className="hover:text-amber transition">Artisan Dashboard</Link></li>
              <li><Link href="/skill-development" className="hover:text-amber transition">Skill Development</Link></li>
              <li><Link href="/event-registration" className="hover:text-amber transition">Event Registration</Link></li>
              <li><Link href="/success-stories" className="hover:text-amber transition">Artisan Success Stories</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-playfair text-lg font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link href="/contact" className="hover:text-amber transition">Contact Us</Link></li>
              <li><Link href="/help" className="hover:text-amber transition">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-amber transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber transition">Terms of Service</Link></li>
              <li><Link href="/returns" className="hover:text-amber transition">Return & Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm">© 2023 KarigarConnect. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/124px-PayPal.svg.png" alt="PayPal" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
}
