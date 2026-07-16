import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <>
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to take control of your pipeline?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join sales professionals who never miss a follow-up. Start for free,
            no credit card required.
          </p>
          <Button size="lg" asChild>
            <Link to="/auth?mode=register">Get Started Free — It's Free</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link
              to="/auth?mode=login"
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
      <footer className="py-6 border-t border-border bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 LeadFlow CRM
          </p>
        </div>
      </footer>
    </>
  );
}
