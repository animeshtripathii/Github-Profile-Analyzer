import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { ToastProvider } from './components/Toast';

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/:username" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}
