import type { ReactNode } from 'react'

interface ReactMarkdownMockProps {
  children?: ReactNode
}

const ReactMarkdownMock = ({ children }: ReactMarkdownMockProps) => {
  return <div data-testid="react-markdown">{children}</div>
}

export default ReactMarkdownMock
