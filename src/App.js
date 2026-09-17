import { useEffect, useState } from 'react';
import './App.css';
import Footer from './Components/Footer/Footer';
import NavBar from './Components/Nav Bar/Nav_Bar';
import Cards from './Components/Cards/Cards';
import Login from './Pages/login/Login';

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    const checkToken = () => {
      const hasToken = Boolean(localStorage.getItem('token'));
      setIsAuthenticated(hasToken);
      if (!hasToken && window.location.pathname === '/home') {
        setRoute('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', checkToken);
    const tokenCheck = window.setInterval(checkToken, 250);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', checkToken);
      window.clearInterval(tokenCheck);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    window.location.assign('/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setRoute('/');
    window.history.pushState({}, '', '/');
  };

  if (route === '/home' && isAuthenticated) {
    return (
      <div className="App">
        <NavBar onLogout={handleLogout} />
        <Cards />
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <Login onLogin={handleLogin} />
    </div>
  );
}

export default App;