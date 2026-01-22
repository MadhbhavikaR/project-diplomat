import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionView from '../components/SessionView';
import { renderWithProviders } from '../test-utils';

describe('SessionView Component', () => {
  it('renders session view with form elements', () => {
    renderWithProviders(<SessionView />);
    
    expect(screen.getByText('Session')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('Session started')).toBeInTheDocument();
  });

  it('allows typing in message input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SessionView />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    await user.type(input, 'Hello, agent!');
    
    expect(input).toHaveValue('Hello, agent!');
  });

  it('clears input after form submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SessionView />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    await user.type(input, 'Test message');
    
    const consoleSpy = jest.spyOn(console, 'log');
    await user.click(screen.getByText('Send'));
    
    expect(consoleSpy).toHaveBeenCalledWith('Sending message:', 'Test message');
    expect(input).toHaveValue('');
  });

  it('does not submit empty messages', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SessionView />);
    
    const consoleSpy = jest.spyOn(console, 'log');
    await user.click(screen.getByText('Send'));
    
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('handles form submission with error', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error');
    
    // Mock console.log to throw error
    jest.spyOn(console, 'log').mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    
    renderWithProviders(<SessionView />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    await user.type(input, 'Error test');
    await user.click(screen.getByText('Send'));
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending message:', expect.any(Error));
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<SessionView />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByText('Send');
    
    expect(input).toHaveAttribute('type', 'text');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('matches snapshot', () => {
    const { asFragment } = renderWithProviders(<SessionView />);
    expect(asFragment()).toMatchSnapshot();
  });
});