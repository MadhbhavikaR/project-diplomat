import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FileExplorerComponent from './FileExplorerComponent'
import { repoService } from '../../services/repoService'
import { useStore } from '../../store/store'

jest.mock('../../services/repoService', () => ({
  repoService: {
    listTree: jest.fn(),
    readFile: jest.fn(),
    createFile: jest.fn(),
    createFolder: jest.fn(),
    deletePath: jest.fn(),
    renamePath: jest.fn(),
  },
}))

jest.mock('../../store/store', () => ({
  useStore: jest.fn(),
}))

const mockedUseStore = useStore as unknown as jest.Mock

describe('FileExplorerComponent', () => {
  beforeEach(() => {
    ;(repoService.listTree as jest.Mock).mockResolvedValue([
      { path: '/repo/src', name: 'src', type: 'directory', children: [
        { path: '/repo/src/main.ts', name: 'main.ts', type: 'file' },
      ] },
    ])
    ;(repoService.readFile as jest.Mock).mockResolvedValue('content')

    mockedUseStore.mockImplementation((selector: any) => {
      const state = {
        openFile: jest.fn(),
      }
      return selector ? selector(state) : state
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders file tree', async () => {
    render(<FileExplorerComponent repoPath="/repo" />)

    expect(await screen.findByText('src')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Expand src'))
    expect(await screen.findByText('main.ts')).toBeInTheDocument()
  })

  it('opens a file when clicked', async () => {
    const openFile = jest.fn()
    mockedUseStore.mockImplementation((selector: any) => {
      const state = { openFile }
      return selector ? selector(state) : state
    })

    render(<FileExplorerComponent repoPath="/repo" />)

    fireEvent.click(await screen.findByText('src'))
    fireEvent.click(screen.getByLabelText('Expand src'))
    fireEvent.click(await screen.findByText('main.ts'))

    await waitFor(() => {
      expect(openFile).toHaveBeenCalled()
    })
  })

  it('shows create form when New File is clicked', async () => {
    render(<FileExplorerComponent repoPath="/repo" />)

    fireEvent.click(screen.getByText('New File'))
    expect(screen.getByPlaceholderText('New file name')).toBeInTheDocument()
  })
})
