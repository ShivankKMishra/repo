import { Link } from 'wouter';

export default function HeroSection() {
  return (
    <section className="heritage-pattern text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            Discover India's Rich Handicraft Heritage
          </h1>
          <p className="text-lg mb-8">
            Connect directly with skilled artisans and bring authentic handcrafted treasures into your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products">
              <a className="bg-cream text-terracotta font-medium px-6 py-3 rounded-full inline-block text-center hover:bg-amber hover:text-white transition duration-300">
                Explore Crafts
              </a>
            </Link>
            <Link href="/artisans">
              <a className="bg-transparent border-2 border-cream text-cream font-medium px-6 py-3 rounded-full inline-block text-center hover:bg-cream/20 transition duration-300">
                Meet Artisans
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
