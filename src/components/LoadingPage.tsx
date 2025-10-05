import { Spinner } from '~/components/ui/spinner'

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Spinner className="h-12 w-12 mx-auto" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
