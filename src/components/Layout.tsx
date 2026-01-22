import { Outlet } from 'react-router-dom';
import { useAgentStore } from '../store/useAgentStore';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentAgent, currentSession } = useAgentStore();

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>ADK Web - React</h1>
        {currentAgent && <div className="current-agent">Agent: {currentAgent.name}</div>}
        {currentSession && <div className="current-session">Session: {currentSession.id}</div>}
      </header>
      
      <main className="app-main">
        {children || <Outlet />}
      </main>
      
      <footer className="app-footer">
        <div>ADK Web React Migration - Phase 1</div>
      </footer>
    </div>
  );
};

export default Layout;