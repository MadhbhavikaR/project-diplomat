import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AgentList from './components/AgentList';
import SessionView from './components/SessionView';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<AgentList />} />
          <Route path="/agents" element={<AgentList />} />
          <Route path="/session" element={<SessionView />} />
          <Route path="/session/:sessionId" element={<SessionView />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App;
