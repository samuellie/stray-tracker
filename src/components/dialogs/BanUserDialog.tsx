import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { UserWithRole } from 'better-auth/plugins'
import { useAdminBanUser } from '~/hooks/server/useAdminBanUser'
import { useState } from 'react'

interface BanUserDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: UserWithRole | null
  onSuccess?: () => void
}

export function BanUserDialog({
  isOpen,
  onOpenChange,
  selectedUser,
  onSuccess,
}: BanUserDialogProps) {
  const [banReason, setBanReason] = useState('')
  const [banDeadline, setBanDeadline] = useState('')
  const banUserMutation = useAdminBanUser()

  const handleCancel = () => {
    setBanReason('')
    setBanDeadline('')
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser || !banReason.trim()) return

    try {
      const deadline = banDeadline ? new Date(banDeadline) : undefined
      await banUserMutation.mutateAsync({
        user: selectedUser,
        reason: banReason,
        deadline,
      })

      // Reset form and close dialog
      setBanReason('')
      setBanDeadline('')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error banning user:', error)
    }
  }

  const isSubmitDisabled = !banReason.trim() || banUserMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            {selectedUser && (
              <>
                You are about to ban <strong>{selectedUser.name}</strong> (
                {selectedUser.email}). Please provide a reason for this action.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ban-reason">Ban Reason *</Label>
            <Textarea
              id="ban-reason"
              placeholder="Enter the reason for banning this user..."
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              className="min-h-[80px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ban-deadline">Ban Deadline (Optional)</Label>
            <Input
              id="ban-deadline"
              type="datetime-local"
              value={banDeadline}
              onChange={e => setBanDeadline(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for permanent ban
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={banUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitDisabled}
            >
              {banUserMutation.isPending ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
