import * as React from 'react'
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
  component: ShadcnTestComponent,
})

function ShadcnTestComponent() {
  const [inputValue, setInputValue] = React.useState('')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">shadcn/ui Component Test Page</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>Test different button styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Button Sizes</CardTitle>
            <CardDescription>Check button sizing consistency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🎯</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input Component</CardTitle>
            <CardDescription>Test form inputs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter some text..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
            <p className="text-sm text-gray-600">
              Input value: <strong>{inputValue || 'empty'}</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Card Layout</CardTitle>
            <CardDescription>Full-width card example</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              This card spans multiple columns on larger screens, demonstrating
              the responsive grid system. You can customize spacing, colors, and
              layout using Tailwind CSS classes combined with the shadcn/ui
              design tokens.
            </p>
            <div className="mt-4 flex gap-4">
              <Button>Test Action 1</Button>
              <Button variant="outline">Test Action 2</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
