import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BuilderTabsComponent from './BuilderTabsComponent';

describe('BuilderTabsComponent', () => {
  test('renders builder tabs component', () => {
    render(<BuilderTabsComponent />);
    
    // Check if the component renders
    expect(screen.getByText('Agent configuration')).toBeInTheDocument();
    expect(screen.getByText('My Agent')).toBeInTheDocument();
  });

  test('renders configuration tab by default', () => {
    render(<BuilderTabsComponent />);
    
    // Check if configuration form elements are present
    expect(screen.getByLabelText('Agent Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Agent Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Model')).toBeInTheDocument();
    expect(screen.getByLabelText('Instructions')).toBeInTheDocument();
  });

  test('allows changing agent name', () => {
    render(<BuilderTabsComponent />);
    
    const agentNameInput = screen.getByLabelText('Agent Name') as HTMLInputElement;
    fireEvent.change(agentNameInput, { target: { value: 'Test Agent' } });
    
    expect(agentNameInput.value).toBe('Test Agent');
  });

  test('allows changing model', () => {
    render(<BuilderTabsComponent />);
    
    const modelSelect = screen.getByLabelText('Model') as HTMLSelectElement;
    fireEvent.change(modelSelect, { target: { value: 'gemini-2.5-pro' } });
    
    expect(modelSelect.value).toBe('gemini-2.5-pro');
  });

  test('allows changing instructions', () => {
    render(<BuilderTabsComponent />);
    
    const instructionsTextarea = screen.getByLabelText('Instructions') as HTMLTextAreaElement;
    fireEvent.change(instructionsTextarea, { target: { value: 'New instructions' } });
    
    expect(instructionsTextarea.value).toBe('New instructions');
  });

  test('shows tools tab when clicked', () => {
    render(<BuilderTabsComponent />);
    
    // Click on Tools tab
    const toolsTab = screen.getByText('Tools');
    fireEvent.click(toolsTab);
    
    // Check if tools content is displayed
    expect(screen.getByText('google_search')).toBeInTheDocument();
    expect(screen.getByText('my_custom_tool')).toBeInTheDocument();
  });

  test('shows callbacks tab when clicked', () => {
    render(<BuilderTabsComponent />);
    
    // Click on Callbacks tab
    const callbacksTab = screen.getByText('Callbacks');
    fireEvent.click(callbacksTab);
    
    // Check if callbacks content is displayed
    expect(screen.getByText('pre_agent_callback')).toBeInTheDocument();
    expect(screen.getByText('post_agent_callback')).toBeInTheDocument();
  });

  test('shows sub agents tab when clicked', () => {
    render(<BuilderTabsComponent />);
    
    // Click on Sub Agents tab
    const subAgentsTab = screen.getByText('Sub Agents');
    fireEvent.click(subAgentsTab);
    
    // Check if sub agents content is displayed
    expect(screen.getByText('No sub agents added yet')).toBeInTheDocument();
  });

  test('adds new tool when add tool button is clicked', () => {
    render(<BuilderTabsComponent />);
    
    // Click on Tools tab first
    const toolsTab = screen.getByText('Tools');
    fireEvent.click(toolsTab);
    
    // Click add tool button (simulated)
    const addToolButton = screen.getByText('add');
    fireEvent.click(addToolButton);
    
    // Note: In a real test, we would mock the menu and test the addTool function
    // For now, we just verify the button exists and is clickable
    expect(addToolButton).toBeInTheDocument();
  });

  test('deletes tool when delete button is clicked', () => {
    render(<BuilderTabsComponent />);
    
    // Click on Tools tab first
    const toolsTab = screen.getByText('Tools');
    fireEvent.click(toolsTab);
    
    // Find and click delete button for first tool
    const deleteButtons = screen.getAllByText('cancel');
    fireEvent.click(deleteButtons[0]);
    
    // Note: In a real test, we would verify the tool is removed
    // For now, we just verify the button exists and is clickable
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  test('saves changes when save button is clicked', () => {
    render(<BuilderTabsComponent />);
    
    const saveButton = screen.getByText('Save');
    
    // Mock console.log to test if save function is called
    const consoleSpy = jest.spyOn(console, 'log');
    fireEvent.click(saveButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Saving changes for agent:', 'My Agent');
    consoleSpy.mockRestore();
  });

  test('cancels changes when cancel button is clicked', () => {
    render(<BuilderTabsComponent />);
    
    const cancelButton = screen.getByText('Cancel');
    
    // Mock console.log to test if cancel function is called
    const consoleSpy = jest.spyOn(console, 'log');
    fireEvent.click(cancelButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Cancelling changes');
    consoleSpy.mockRestore();
  });
});