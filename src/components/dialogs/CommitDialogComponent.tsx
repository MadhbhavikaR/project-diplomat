import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { useState } from 'react'

interface CommitDialogProps {
  open: boolean
  onCommit: (message: string) => void
  onCancel: () => void
}

const CommitDialogComponent = ({ open, onCommit, onCancel }: CommitDialogProps) => {
  const [message, setMessage] = useState('')

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Commit changes</DialogTitle>
      <DialogContent>
        <TextField
          label="Commit message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          fullWidth
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onCommit(message)}
          variant="contained"
          color="primary"
          disabled={!message.trim()}
        >
          Commit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CommitDialogComponent
