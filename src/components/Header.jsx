import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Home, Shield, MessageCircle, LogOut, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { APP_CONFIG } from '../config/app'
import { ModeToggle } from './mode-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

const Header = ({ session }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src={APP_CONFIG.logo} 
            alt={APP_CONFIG.name} 
            className="h-6 w-6 rounded-full"
          />
          <span className="font-bold text-lg hidden sm:inline-block">{APP_CONFIG.name}</span>
        </Link>

        {/* Desktop Navigation (Always Hidden) */}
        <nav className="hidden items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/admin-contact">
              <MessageCircle className="mr-2 h-4 w-4" />
              Admin Contact
            </Link>
          </Button>
          {session ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/login">
                <Users className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu (Always Visible) */}
        <div className="flex items-center space-x-2">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <Link to="/" className="flex items-center space-x-2 mb-6" onClick={() => document.getElementById('close-sheet')?.click()}>
                <img 
                  src={APP_CONFIG.logo} 
                  alt={APP_CONFIG.name} 
                  className="h-8 w-8 rounded-full"
                />
                <span className="font-bold text-xl">{APP_CONFIG.name}</span>
              </Link>
              <Separator className="mb-4" />
              <nav className="flex flex-col space-y-2">
                <SheetClose asChild>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/admin-contact">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Admin Contact
                    </Link>
                  </Button>
                </SheetClose>
                {session ? (
                  <>
                    <SheetClose asChild>
                      <Button variant="ghost" className="justify-start" asChild>
                        <Link to="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" className="justify-start text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/login">
                        <Users className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Header