import { render, screen, fireEvent } from '@testing-library/react'
import BuilderAssistantComponent from './BuilderAssistantComponent'
import { useStore } from '../../store/store'

jest.mock('../../store/store', () => ({
  useStore: jest.fn(),
}))

const mockedUseStore = useStore as unknown as jest.Mock

jest.mock('../../services/streamChatService', () => ({
  streamChatService: {
    connect: jest.fn(() => ({
      readyState: 1,
      close: jest.fn(),
      onmessage: null,
    })),
    sendMessage: jest.fn(),
  },
}))

describe('BuilderAssistantComponent', () => {
  const setAssistantMode = jest.fn()

  beforeEach(() => {
    mockedUseStore.mockImplementation((selector: any) => {
      const state = {
        assistantMode: 'plan',
        setAssistantMode,
      }
      return selector ? selector(state) : state
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders when visible', () => {
    render(
      <BuilderAssistantComponent
        isVisible={true}
        appName="Demo"
        onClosePanel={jest.fn()}
        onReloadCanvas={jest.fn()}
      />
    )

    expect(screen.getByText('Assistant')).toBeInTheDocument()
  })

  it('toggles Plan/Act mode', () => {
    render(
      <BuilderAssistantComponent
        isVisible={true}
        appName="Demo"
        onClosePanel={jest.fn()}
        onReloadCanvas={jest.fn()}
      />
    )

    fireEvent.click(screen.getByText('Act'))
    expect(setAssistantMode).toHaveBeenCalledWith('act')
  })
})
