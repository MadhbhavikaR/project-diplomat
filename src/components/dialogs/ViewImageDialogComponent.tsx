import { Dialog, DialogContent, DialogTitle } from '@mui/material'

interface ViewImageDialogProps {
  open: boolean
  title: string
  imageUrl: string
  onClose: () => void
}

const ViewImageDialogComponent = ({ open, title, imageUrl, onClose }: ViewImageDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <img src={imageUrl} alt={title} style={{ width: '100%', height: 'auto' }} />
      </DialogContent>
    </Dialog>
  )
}

export default ViewImageDialogComponent
