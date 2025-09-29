import { createFileRoute } from '@tanstack/react-router'
import { auth } from '../lib/auth'
import { useEffect } from 'react'
import { redirect } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { validateLoginForm } from '~/form-config'

export const Route = createFileRoute('/login')({
  component: Login,
  beforeLoad: async ({ context, location }) => {
    // Check if user is already authenticated on the client side
    // This is a simplified check - in production you'd use proper session management
    try {
      // For now, we'll let the UI handle checking authentication
      // The actual auth check happens in the middleware
    } catch (error) {
      // User not authenticated, continue to login page
    }

    // If user tries to access login while logged in, redirect
    // This would need proper session checking in a real implementation
  },
})

function Login() {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch('/api/auth/sign-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: value.email,
            password: value.password,
          }),
        })

        if (!response.ok) {
          throw new Error('Invalid email or password')
        }

        const result = await response.json()

        // Redirect to home page after successful login
        navigate({ to: '/' })
      } catch (error) {
        console.error('Login failed:', error)
        throw new Error('Login failed. Please check your credentials.')
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Stray Tracker</CardTitle>
          <CardDescription>
            Sign in to help care for stray animals in your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            {/* Email/Password form - primary login method */}
            <div className="space-y-3">
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? 'Email is required'
                      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                        ? 'Please enter a valid email address'
                        : undefined,
                }}
                children={field => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                      placeholder="Enter your email"
                      className="mt-1"
                    />
                    {field.state.meta.errors ? (
                      <p className="mt-1 text-sm text-red-600">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    ) : null}
                  </div>
                )}
              />

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    !value ? 'Password is required' : undefined,
                }}
                children={field => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                      placeholder="Enter your password"
                      className="mt-1"
                    />
                    {field.state.meta.errors ? (
                      <p className="mt-1 text-sm text-red-600">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    ) : null}
                  </div>
                )}
              />

              <form.Subscribe
                selector={state => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                )}
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.href = '/api/auth/google'
                }}
              >
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.href = '/api/auth/facebook'
                }}
              >
                Continue with Facebook
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.href = '/api/auth/instagram'
                }}
              >
                Continue with Instagram
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
