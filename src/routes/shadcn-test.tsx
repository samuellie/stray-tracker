import { createFileRoute } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'

export const Route = createFileRoute('/shadcn-test')({
  component: ShadcnTest,
})

function ShadcnTest() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">shadcn/ui Components Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            Test different button styles and sizes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">📝</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input Component</CardTitle>
          <CardDescription>Test input field styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Enter some text..." />
          <Input type="email" placeholder="Enter your email..." />
          <Input disabled placeholder="Disabled input" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Card Layout</CardTitle>
          <CardDescription>Demonstrate card structure</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This is the main content area of the card. Cards are useful for
            grouping related content and actions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
