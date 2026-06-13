import { Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { getErrorMessage } from '~/lib/errors'
import {
  useIsFollowingStray,
  useSetFollowStray,
} from '~/hooks/server/useFollowStray'

interface FollowStrayButtonProps {
  strayId: number
  size?: 'sm' | 'default'
  className?: string
}

export function FollowStrayButton({
  strayId,
  size = 'default',
  className,
}: FollowStrayButtonProps) {
  const { data, isLoading } = useIsFollowingStray(strayId)
  const setFollowMutation = useSetFollowStray(strayId)
  const following = data?.following ?? false

  const handleClick = () => {
    setFollowMutation.mutate(!following, {
      onError: error => {
        const { title, description } = getErrorMessage(
          error,
          following ? 'Could not unfollow' : 'Could not follow'
        )
        toast.error(title, { description })
      },
    })
  }

  return (
    <Button
      type="button"
      variant={following ? 'secondary' : 'outline'}
      size={size}
      className={className}
      disabled={isLoading}
      onClick={handleClick}
      aria-pressed={following}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 mr-2 ${following ? 'fill-current text-red-500' : ''}`}
        />
      )}
      {following ? 'Following' : 'Follow'}
    </Button>
  )
}
