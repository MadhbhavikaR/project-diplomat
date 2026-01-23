import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { useState } from 'react'

interface EditJsonDialogProps {
  open: boolean
  title: string
  initialValue: string
  onSave: (value: string) => void
  onCancel: () => void
}

const EditJsonDialogComponent = ({
  open,
  title,
  initialValue,
  onSave,
  onCancel,
}: EditJsonDialogProps) => {
  const [value, setValue] = useState(initialValue)

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          value={value}
          onChange={(event) => setValue(event.target.value)}
          multiline
          minRows={12}
          fullWidth
          placeholder="Paste JSON here"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(value)} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditJsonDialogComponent
