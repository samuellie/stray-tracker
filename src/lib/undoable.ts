import { toast } from 'sonner'

/**
 * Shows an "action done" toast with an Undo button and only commits the
 * action once the toast leaves the screen without Undo being clicked.
 *
 * Trade-off: closing the tab within `duration` means the action never
 * commits — acceptable for low-stakes deletes and far simpler than a
 * server-side soft-delete with a deletedAt column.
 */
export function toastUndoable({
  message,
  description,
  onCommit,
  duration = 5000,
}: {
  message: string
  description?: string
  onCommit: () => void
  duration?: number
}) {
  let undone = false
  let committed = false
  const commit = () => {
    if (undone || committed) return
    committed = true
    onCommit()
  }

  toast(message, {
    description,
    duration,
    action: {
      label: 'Undo',
      onClick: () => {
        undone = true
      },
    },
    onAutoClose: commit,
    onDismiss: commit,
  })
}
