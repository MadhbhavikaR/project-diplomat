import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatComponent from './ChatComponent'

describe('ChatComponent', () => {
  it('renders chat component with input and send button', () => {
    render(<ChatComponent />)
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('allows typing in the input field', () => {
    render(<ChatComponent />)
    const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement
    
    fireEvent.change(input, { target: { value: 'Hello, world!' } })
    expect(input.value).toBe('Hello, world!')
  })

  it('shows loading state when sending message', () => {
    render(<ChatComponent />)
    const input = screen.getByPlaceholderText('Type your message...')
    const button = screen.getByText('Send')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(button)
    
    expect(screen.getByText('Thinking...')).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('disables send button when input is empty', () => {
    render(<ChatComponent />)
    const button = screen.getByText('Send')
    
    expect(button).toBeDisabled()
  })
})