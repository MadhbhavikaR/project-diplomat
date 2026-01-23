import ConfirmationDialogComponent from './ConfirmationDialogComponent'

interface ResetDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ResetDialogComponent = ({ open, onConfirm, onCancel }: ResetDialogProps) => {
  return (
    <ConfirmationDialogComponent
      open={open}
      title="Reset changes"
      description="Reset working tree to last commit?"
      confirmLabel="Reset"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}

export default ResetDialogComponent
