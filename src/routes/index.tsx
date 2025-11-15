import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ArrowRightIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { authClient } from '~/lib/auth-client'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session } = authClient.useSession()

  const AuthButtons = () => {
    if (session) {
      return (
        <Button asChild>
          <Link to="/app">
            Go to App <ArrowRight />
          </Link>
        </Button>
      )
    }

    return (
      <>
        <Button asChild variant="ghost">
          <Link to="/auth/$authView" params={{ authView: 'sign-in' }}>
            Login
          </Link>
        </Button>
        <Button asChild>
          <Link to="/auth/$authView" params={{ authView: 'sign-up' }}>
            Sign Up
          </Link>
        </Button>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">
              🐾 Stray Tracker
            </div>
            <div className="space-x-4">
              <AuthButtons />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Help Our Furry Friends Find Their Way Home
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community in tracking, caring for, and reuniting stray cats
            and dogs. Together, we can make a difference in the lives of animals
            in our neighborhoods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link to="/auth/$authView" params={{ authView: 'sign-up' }}>
                Join the Community
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3"
            >
              <Link to="/auth/$authView" params={{ authView: 'sign-in' }}>
                Login
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How You Can Help
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform empowers communities to take collective action in
            caring for stray animals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">📍</div>
              <CardTitle>Report Sightings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Spot a stray animal? Report its location, photos, and
                characteristics to help the community track and care for it.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">👥</div>
              <CardTitle>Community Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect with neighbors, vets, and animal shelters. Share
                information and coordinate efforts to help stray animals.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">📊</div>
              <CardTitle>Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor the care and status of animals in your community. See
                the impact of collective action in real-time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">📸</div>
              <CardTitle>Photo Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload and share photos to help identify animals and create
                detailed profiles for better tracking and care.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">🗺️</div>
              <CardTitle>Location Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Map sighting locations and track movement patterns to understand
                animal behavior and care needs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">🏆</div>
              <CardTitle>Community Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Earn achievements and recognition for your contributions to
                animal welfare in your community.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1,200+</div>
              <div className="text-blue-100">Animals Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">850+</div>
              <div className="text-blue-100">Community Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">340</div>
              <div className="text-blue-100">Animals Reunited</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25</div>
              <div className="text-blue-100">Partner Organizations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of animal lovers who are already helping stray
            animals find care and homes. Every sighting report and community
            member makes a real impact.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link to="/auth/$authView" params={{ authView: 'sign-up' }}>
              Get Started Today
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-4">
            🐾 Stray Tracker
          </div>
          <p className="text-muted-foreground mb-4">
            Building communities that care for stray animals, one neighborhood
            at a time.
          </p>
          <div className="text-sm text-muted-foreground">
            © 2025 Stray Tracker. Making a difference in animal welfare through
            community action.
          </div>
        </div>
      </footer>
    </div>
  )
}
