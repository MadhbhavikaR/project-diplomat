import { createTheme } from '@mui/material/styles'
import { palette } from './palette'

export const theme = createTheme({
  palette,
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
})
