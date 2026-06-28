import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  addPostComment,
  createPost,
  deletePost,
  getCommunityPosts,
  getPostComments,
  reactToPost,
} from '~/server/posts'

export type FeedPost = Awaited<ReturnType<typeof getCommunityPosts>>[number]

const PAGE_SIZE = 10
const feedKey = ['community-posts']

export function useCommunityFeed() {
  return useInfiniteQuery({
    queryKey: feedKey,
    queryFn: ({ pageParam = 0 }) =>
      getCommunityPosts({ data: { limit: PAGE_SIZE, offset: pageParam } }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    staleTime: 60 * 1000,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      content: string
      title?: string
      postType?: 'story' | 'announcement' | 'help' | 'general'
      strayId?: number
    }) => createPost({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feedKey }),
  })
}

export function useReactToPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      postId: number
      reaction: 'like' | 'love' | 'care' | 'laugh' | 'celebrate' | null
    }) => reactToPost({ data: input }),
    // Optimistically flip the reaction + counter in every loaded page
    onMutate: async ({ postId, reaction }) => {
      await queryClient.cancelQueries({ queryKey: feedKey })
      const previous = queryClient.getQueryData(feedKey)
      queryClient.setQueryData<{ pages: FeedPost[][]; pageParams: unknown[] }>(
        feedKey,
        old =>
          old && {
            ...old,
            pages: old.pages.map(page =>
              page.map(post => {
                if (post.id !== postId) return post
                const had = post.myReaction != null
                const has = reaction != null
                return {
                  ...post,
                  myReaction: reaction,
                  likeCount:
                    (post.likeCount ?? 0) + (has ? 1 : 0) - (had ? 1 : 0),
                }
              })
            ),
          }
      )
      return { previous }
    },
    onError: (_error, _input, mutateContext) => {
      if (mutateContext?.previous) {
        queryClient.setQueryData(feedKey, mutateContext.previous)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: feedKey }),
  })
}

export function usePostComments(postId?: number) {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => getPostComments({ data: { postId: postId! } }),
    staleTime: 60 * 1000,
    enabled: postId != null,
  })
}

export function useAddPostComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      addPostComment({ data: { postId, content } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] })
      queryClient.invalidateQueries({ queryKey: feedKey })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: number) => deletePost({ data: { postId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feedKey }),
  })
}
