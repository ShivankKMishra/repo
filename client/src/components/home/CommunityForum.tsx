import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ForumPost } from '@shared/schema';
import { useState } from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const forumPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().min(1, "Please select a category")
});

type PostFormValues = z.infer<typeof forumPostSchema>;

export default function CommunityForum() {
  const { toast } = useToast();
  // Try to use auth and handle it safely if not in an auth context
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    // silently handle the case where auth provider isn't available
  }
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: forumPosts, isLoading } = useQuery<(ForumPost & { replyCount: number })[]>({
    queryKey: ['/api/forum'],
    refetchInterval: false,
  });
  
  const form = useForm<PostFormValues>({
    resolver: zodResolver(forumPostSchema),
    defaultValues: {
      title: '',
      content: '',
      category: ''
    },
  });
  
  const onSubmit = async (values: PostFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to post on the forum",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await apiRequest('POST', '/api/forum', values);
      form.reset();
      toast({
        title: "Success!",
        description: "Your discussion has been posted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forum'] });
    } catch (error) {
      toast({
        title: "Failed to post",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-cream border-t border-amber/20">
      <div className="container mx-auto px-4">
        <h2 className="font-playfair text-3xl font-bold text-warmGray text-center mb-2">
          Join Our Community
        </h2>
        <p className="text-center text-warmGray/80 mb-8 max-w-2xl mx-auto">
          Connect with fellow craft enthusiasts and artisans to share experiences, seek advice, and celebrate India's rich craft heritage.
        </p>
        
        <Card className="bg-white rounded-lg shadow-lg">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-playfair text-xl font-bold text-warmGray mb-4">Recent Discussions</h3>
                
                {isLoading ? (
                  <div className="flex justify-center my-8">
                    <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {forumPosts?.slice(0, 3).map((post) => (
                      <Link key={post._id} href={`/forum/${post._id}`}>
                        <div className="p-4 rounded-lg bg-cream hover:bg-cream/80 transition cursor-pointer">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-medium text-warmGray">{post.title}</h4>
                            <span className="text-xs text-teal bg-teal/10 px-2 py-1 rounded-full">
                              {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                            </span>
                          </div>
                          <p className="text-sm text-warmGray/80 mb-2 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>Posted {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'recently'}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    {forumPosts?.length === 0 && (
                      <p className="text-center py-6 text-warmGray/80">
                        No discussions yet. Be the first to start one!
                      </p>
                    )}
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <Link href="/forum">
                    <a className="text-teal font-medium hover:text-terracotta transition">
                      Browse All Discussions
                    </a>
                  </Link>
                </div>
              </div>
              
              <div>
                <h3 className="font-playfair text-xl font-bold text-warmGray mb-4">Join the Conversation</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-warmGray">Discussion Topic</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="What would you like to discuss?" 
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-warmGray">Your Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={4} 
                              placeholder="Share your thoughts, questions, or experiences..." 
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-warmGray">Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="techniques">Craft Techniques</SelectItem>
                              <SelectItem value="business">Business & Marketing</SelectItem>
                              <SelectItem value="materials">Materials & Supplies</SelectItem>
                              <SelectItem value="events">Events & Exhibitions</SelectItem>
                              <SelectItem value="general">General Discussion</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !user}
                      className="w-full bg-terracotta hover:bg-amber text-white font-medium py-2 rounded-md transition duration-300"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        'Post Discussion'
                      )}
                    </Button>
                    
                    {!user && (
                      <p className="text-center text-xs text-amber mt-2">
                        <Link href="/auth">
                          <a className="underline">Login or register</a>
                        </Link> to join the conversation
                      </p>
                    )}
                  </form>
                </Form>
                
                <div className="mt-6 bg-teal/10 p-4 rounded-lg">
                  <h4 className="font-medium text-teal mb-2">Community Guidelines</h4>
                  <ul className="text-sm text-warmGray/80 space-y-1 list-disc pl-5">
                    <li>Be respectful and supportive of fellow artisans</li>
                    <li>Share knowledge freely but respect intellectual property</li>
                    <li>Keep discussions focused on crafts and related topics</li>
                    <li>No spam or excessive self-promotion</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
