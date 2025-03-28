import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await apiRequest('POST', '/api/newsletter', { email });
      setEmail('');
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter"
      });
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section className="py-12 bg-teal text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-playfair text-3xl font-bold mb-4">Stay Connected with Artisan Community</h2>
        <p className="max-w-2xl mx-auto mb-8">Subscribe to our newsletter for the latest artisan stories, upcoming events, and exclusive craft collections.</p>
        
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address" 
            className="flex-grow p-3 rounded-l-lg sm:rounded-r-none rounded-r-lg text-warmGray focus:outline-none" 
            required 
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-amber hover:bg-terracotta text-white font-medium p-3 rounded-r-lg sm:rounded-l-none rounded-l-lg transition duration-300 whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </Button>
        </form>
        
        <p className="text-sm mt-4 text-white/80">We respect your privacy and will never share your information.</p>
      </div>
    </section>
  );
}
