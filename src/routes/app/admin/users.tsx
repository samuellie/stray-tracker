import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router'
import { authClient } from '~/lib/auth-client'

export const Route = createFileRoute('/app/admin/users')({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const { data: session } = await authClient.getSession()
    console.log(session)

    if ((session?.user as any)?.role !== 'user') {
      throw notFound()
    }
  },
})

function RouteComponent() {
  return <div>Hello "/app/admin/user"!</div>
}
