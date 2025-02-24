import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { logout } from '../services/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-xl shadow-lg' 
          : 'bg-gradient-to-b from-gray-800 to-gray-900'}`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 transition-all duration-300 hover:scale-105"
              >
                <span className={`text-2xl font-bold transition-all duration-300
                  ${isScrolled
                    ? 'bg-gradient-to-r from-primary-400 via-primary-300 to-primary-500 text-transparent bg-clip-text drop-shadow-sm'
                    : 'bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 text-transparent bg-clip-text'}`}
                >
                  Ngakak
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <button
                onClick={handleLogout}
                className={`relative py-2 transition-all duration-300 text-gray-300 hover:text-primary-400`}
              >
                Logout
                <span 
                  className={`absolute bottom-0 left-0 w-full h-0.5 transform origin-left transition-all duration-300 ease-out scale-x-0 bg-current`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

