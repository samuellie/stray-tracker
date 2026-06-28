import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  Heart,
  Loader2,
  MessageCircle,
  MessagesSquare,
  PawPrint,
  RefreshCw,
  Send,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Skeleton } from '~/components/ui/skeleton'
import { Spinner } from '~/components/ui/spinner'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { authClient } from '~/lib/auth-client'
import { getErrorMessage } from '~/lib/errors'
import { toastUndoable } from '~/lib/undoable'
import { formatRelativeDate } from '~/utils/date'
import {
  useAddPostComment,
  useCommunityFeed,
  useCreatePost,
  useDeletePost,
  usePostComments,
  useReactToPost,
  type FeedPost,
} from '~/hooks/server/usePosts'

export const Route = createFileRoute('/app/feed/')({
  component: FeedPage,
})

const POST_TYPE_LABELS: Record<string, string> = {
  story: 'Story',
  announcement: 'Announcement',
  help: 'Help needed',
  general: 'General',
}

function FeedPage() {
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunityFeed()

  const posts = data?.pages.flatMap(page => page) ?? []

  const observerTarget = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.5 }
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-muted-foreground">
          Stories, updates and calls for help from your neighbourhood
        </p>
      </div>

      <ComposePost />

      {isLoading ? (
        <div className="space-y-4 mt-6" aria-label="Loading feed">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="font-medium text-destructive">
            {getErrorMessage(error, 'Could not load the feed').title}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <MessagesSquare className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="mt-3 font-medium">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Share a story or ask for help — your post will be the first.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
          <div
            ref={observerTarget}
            className="py-4 flex justify-center"
          >
            {isFetchingNextPage && <Spinner className="size-5 opacity-50" />}
          </div>
        </div>
      )}
    </div>
  )
}

function ComposePost() {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<string>('general')
  const createPostMutation = useCreatePost()

  const handlePost = () => {
    const trimmed = content.trim()
    if (!trimmed) return
    createPostMutation.mutate(
      {
        content: trimmed,
        postType: postType as 'story' | 'announcement' | 'help' | 'general',
      },
      {
        onSuccess: () => {
          setContent('')
          setPostType('general')
          toast.success('Posted!')
        },
        onError: error => {
          const { title, description } = getErrorMessage(
            error,
            'Could not publish the post'
          )
          toast.error(title, {
            description,
            action: { label: 'Retry', onClick: handlePost },
          })
        },
      }
    )
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Textarea
          value={content}
          maxLength={2000}
          rows={3}
          placeholder="Share an update, story, or ask the community for help…"
          onChange={e => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between gap-3">
          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(POST_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            disabled={!content.trim() || createPostMutation.isPending}
            onClick={handlePost}
          >
            {createPostMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PostCard({ post }: { post: FeedPost }) {
  const { data: session } = authClient.useSession()
  const [showComments, setShowComments] = useState(false)
  const reactMutation = useReactToPost()
  const deletePostMutation = useDeletePost()

  const role = (session?.user as { role?: string } | undefined)?.role
  const canDelete =
    session?.user?.id === post.authorId ||
    role === 'admin' ||
    role === 'moderator'
  const liked = post.myReaction != null

  const handleDelete = () => {
    toastUndoable({
      message: 'Post deleted',
      onCommit: () =>
        deletePostMutation.mutate(post.id, {
          onError: error => {
            const { title, description } = getErrorMessage(
              error,
              'Could not delete the post'
            )
            toast.error(title, { description })
          },
        }),
    })
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-1 ring-primary/10">
              <AvatarImage src={post.author.image || ''} />
              <AvatarFallback className="text-sm bg-primary/5 text-primary">
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">
                {post.author.name}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {formatRelativeDate(Number(post.publishedAt))}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.postType && post.postType !== 'general' && (
              <Badge
                variant={post.postType === 'help' ? 'destructive' : 'secondary'}
                className="text-[10px]"
              >
                {POST_TYPE_LABELS[post.postType]}
              </Badge>
            )}
            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                aria-label="Delete post"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {post.title && <h3 className="font-semibold">{post.title}</h3>}
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>

        {post.stray && (
          <Link
            to="/app/strays/$strayId"
            params={{ strayId: post.stray.id.toString() }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <PawPrint className="h-3.5 w-3.5" />
            {post.stray.name || `Unnamed ${post.stray.species}`}
          </Link>
        )}

        <div className="flex items-center gap-4 pt-1 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 px-2 ${liked ? 'text-red-500' : 'text-muted-foreground'}`}
            aria-pressed={liked}
            onClick={() =>
              reactMutation.mutate({
                postId: post.id,
                reaction: liked ? null : 'like',
              })
            }
          >
            <Heart className={`h-4 w-4 mr-1.5 ${liked ? 'fill-current' : ''}`} />
            {post.likeCount ?? 0}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground"
            aria-expanded={showComments}
            onClick={() => setShowComments(open => !open)}
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            {post.commentCount ?? 0}
          </Button>
        </div>

        {showComments && <PostComments postId={post.id} />}
      </CardContent>
    </Card>
  )
}

function PostComments({ postId }: { postId: number }) {
  const [comment, setComment] = useState('')
  const { data: comments, isLoading } = usePostComments(postId)
  const addCommentMutation = useAddPostComment(postId)

  const handleAdd = () => {
    const trimmed = comment.trim()
    if (!trimmed) return
    addCommentMutation.mutate(trimmed, {
      onSuccess: () => setComment(''),
      onError: error => {
        const { title, description } = getErrorMessage(
          error,
          'Could not add the comment'
        )
        toast.error(title, { description })
      },
    })
  }

  return (
    <div className="space-y-3 pt-2">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ) : (
        comments?.map(item => (
          <div key={item.id} className="flex items-start gap-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={item.author.image || ''} />
              <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                {item.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-lg bg-muted/40 px-3 py-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold">
                  {item.author.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeDate(Number(item.createdAt))}
                </span>
              </div>
              <p className="text-sm mt-0.5">{item.content}</p>
            </div>
          </div>
        ))
      )}
      <div className="flex gap-2">
        <Input
          value={comment}
          maxLength={1000}
          placeholder="Write a comment…"
          className="h-9 text-sm"
          onChange={e => setComment(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          className="h-9"
          disabled={!comment.trim() || addCommentMutation.isPending}
          onClick={handleAdd}
        >
          {addCommentMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
