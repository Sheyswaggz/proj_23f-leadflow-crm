import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&h=800"
        alt="Sales team at work"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-block mb-6">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              CRM for Sales Professionals
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Pipeline. Always Under Control.
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Stop losing deals to disorganized follow-ups. LeadFlow gives your
            sales team a focused workspace to capture leads, track
            conversations, and close more deals.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/auth?mode=register">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth?mode=login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
