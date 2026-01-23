import { render, screen, fireEvent } from '@testing-library/react'
import FileTabsComponent from './FileTabsComponent'
import { useStore } from '../../store/store'

jest.mock('../../store/store', () => ({
  useStore: jest.fn(),
}))

const mockedUseStore = useStore as unknown as jest.Mock

describe('FileTabsComponent', () => {
  beforeEach(() => {
    mockedUseStore.mockImplementation((selector: any) => {
      const state = {
        openFiles: {
          '/test/file.ts': { path: '/test/file.ts', content: 'content', language: 'ts', isDirty: true },
        },
        activeFile: '/test/file.ts',
        setActiveFile: jest.fn(),
        closeFile: jest.fn(),
      }
      return selector ? selector(state) : state
    })
  })

  it('renders tabs and dirty indicator', () => {
    render(<FileTabsComponent />)

    expect(screen.getByText('file.ts')).toBeInTheDocument()
    expect(screen.getByText('●')).toBeInTheDocument()
  })

  it('calls closeFile when close button clicked', () => {
    const closeFile = jest.fn()
    mockedUseStore.mockImplementation((selector: any) => {
      const state = {
        openFiles: {
          '/test/file.ts': { path: '/test/file.ts', content: 'content', language: 'ts', isDirty: false },
        },
        activeFile: '/test/file.ts',
        setActiveFile: jest.fn(),
        closeFile,
      }
      return selector ? selector(state) : state
    })

    render(<FileTabsComponent />)

    fireEvent.click(screen.getByText('×'))
    expect(closeFile).toHaveBeenCalledWith('/test/file.ts')
  })
})
