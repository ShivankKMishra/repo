import { Link } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow w-full flex items-center justify-center bg-cream py-12">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-terracotta" />
              <h1 className="text-2xl font-bold text-warmGray">404 Page Not Found</h1>
            </div>

            <p className="mt-4 mb-6 text-sm text-warmGray/80">
              The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to the homepage.
            </p>
            
            <Link href="/">
              <Button className="w-full bg-terracotta hover:bg-amber text-white">
                <Home className="h-4 w-4 mr-2" />
                Return to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
