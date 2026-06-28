import { useState } from 'react'
import { ChevronDown, ChevronUp, Crown, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import { authClient } from '~/lib/auth-client'
import { getErrorMessage } from '~/lib/errors'
import {
  useNamingSuggestions,
  useSelectName,
  useSuggestName,
  useVoteName,
  type NamingSuggestion,
} from '~/hooks/server/useNaming'

interface NamingSuggestionsProps {
  strayId: number
  /** Compact mode shows the top 3 suggestions (used inside the sighting dialog) */
  compact?: boolean
}

export function NamingSuggestions({
  strayId,
  compact = false,
}: NamingSuggestionsProps) {
  const [newName, setNewName] = useState('')
  const { data: session } = authClient.useSession()
  const canSelect = ['admin', 'moderator'].includes(
    ((session?.user as { role?: string } | undefined)?.role ?? '') as string
  )

  const { data: suggestions, isLoading } = useNamingSuggestions(strayId)
  const suggestMutation = useSuggestName(strayId)
  const voteMutation = useVoteName(strayId)
  const selectMutation = useSelectName(strayId)

  const visible = compact ? suggestions?.slice(0, 3) : suggestions

  const handleSuggest = () => {
    const name = newName.trim()
    if (!name) return
    suggestMutation.mutate(name, {
      onSuccess: () => {
        setNewName('')
        toast.success(`"${name}" suggested!`)
      },
      onError: error => {
        const { title, description } = getErrorMessage(
          error,
          'Could not add the suggestion'
        )
        toast.error(title, { description })
      },
    })
  }

  const handleVote = (suggestion: NamingSuggestion, direction: 1 | -1) => {
    // Clicking the same direction again removes the vote
    const vote = suggestion.myVote === direction ? 0 : direction
    voteMutation.mutate({ suggestionId: suggestion.id, vote })
  }

  const handleSelect = (suggestion: NamingSuggestion) => {
    selectMutation.mutate(suggestion.id, {
      onSuccess: () => toast.success(`This stray is now called ${suggestion.name}!`),
      onError: error => {
        const { title, description } = getErrorMessage(
          error,
          'Could not select the name'
        )
        toast.error(title, { description })
      },
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
          {compact ? 'Help name this stray!' : 'Name suggestions'}
        </h3>
      </div>

      <div className="flex gap-2">
        <Input
          value={newName}
          maxLength={50}
          placeholder="Suggest a name…"
          className={compact ? 'h-8 text-sm' : ''}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSuggest()
            }
          }}
        />
        <Button
          type="button"
          size={compact ? 'sm' : 'default'}
          disabled={!newName.trim() || suggestMutation.isPending}
          onClick={handleSuggest}
        >
          {suggestMutation.isPending && (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          )}
          Suggest
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: compact ? 2 : 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !visible || visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No suggestions yet — be the first to propose a name.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {visible.map(suggestion => (
            <li
              key={suggestion.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5"
            >
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${suggestion.myVote === 1 ? 'text-primary' : 'text-muted-foreground'}`}
                  aria-label={`Upvote ${suggestion.name}`}
                  onClick={() => handleVote(suggestion, 1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <span
                  className="text-sm font-semibold w-6 text-center tabular-nums"
                  aria-label={`${suggestion.score} votes`}
                >
                  {suggestion.score}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${suggestion.myVote === -1 ? 'text-destructive' : 'text-muted-foreground'}`}
                  aria-label={`Downvote ${suggestion.name}`}
                  onClick={() => handleVote(suggestion, -1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <span className="flex-1 text-sm font-medium truncate">
                {suggestion.name}
              </span>
              {suggestion.isSelected && (
                <Badge variant="secondary" className="text-[10px]">
                  <Crown className="w-3 h-3 mr-1" />
                  Chosen
                </Badge>
              )}
              {canSelect && !suggestion.isSelected && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={selectMutation.isPending}
                  onClick={() => handleSelect(suggestion)}
                >
                  Select
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
