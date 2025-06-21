import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Home, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Header = ({ session }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-whatsapp rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">FUTURE MINDS</h1>
              <p className="text-xs text-gray-300">Groups Management</p>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-primary/80 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 pb-4 border-t border-primary/20">
            <nav className="space-y-2 mt-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-whatsapp text-white' 
                    : 'hover:bg-primary/80'
                }`}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>

              {session ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === '/admin' 
                        ? 'bg-whatsapp text-white' 
                        : 'hover:bg-primary/80'
                    }`}
                  >
                    <Shield size={20} />
                    <span>Admin Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-600 transition-colors w-full text-left"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === '/login' 
                      ? 'bg-whatsapp text-white' 
                      : 'hover:bg-primary/80'
                  }`}
                >
                  <User size={20} />
                  <span>Admin Login</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
