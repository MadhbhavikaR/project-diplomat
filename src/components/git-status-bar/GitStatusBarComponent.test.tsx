import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import GitStatusBarComponent from './GitStatusBarComponent'
import { repoService } from '../../services/repoService'

jest.mock('../../services/repoService', () => ({
  repoService: {
    getGitStatus: jest.fn(),
    commit: jest.fn(),
    reset: jest.fn(),
  },
}))

describe('GitStatusBarComponent', () => {
  const renderWithClient = () => {
    const client = new QueryClient()
    return render(
      <QueryClientProvider client={client}>
        <GitStatusBarComponent repoPath="/repo" />
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    ;(repoService.getGitStatus as jest.Mock).mockResolvedValue({
      branch: 'main',
      dirtyCount: 2,
      ahead: 1,
      behind: 0,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders git status info', async () => {
    renderWithClient()

    expect(await screen.findByText('main')).toBeInTheDocument()
    expect(await screen.findByText(/2\s*changes/)).toBeInTheDocument()
    expect(screen.getByText(/↑\s*1\s*↓\s*0/)).toBeInTheDocument()
  })

  it('opens commit dialog and submits', async () => {
    renderWithClient()

    fireEvent.click(screen.getByRole('button', { name: 'Open commit dialog' }))
    fireEvent.change(screen.getByLabelText('Commit message'), { target: { value: 'Test commit' } })
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Commit' }))

    await waitFor(() => {
      expect(repoService.commit).toHaveBeenCalledWith('/repo', 'Test commit', [])
    })
  })

  it('opens reset confirmation and submits', async () => {
    renderWithClient()

    fireEvent.click(screen.getByRole('button', { name: 'Open reset confirmation' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset' }))

    await waitFor(() => {
      expect(repoService.reset).toHaveBeenCalledWith('/repo')
    })
  })
})
