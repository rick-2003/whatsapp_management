import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { supabase } from './lib/supabase'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import GroupDetail from './pages/GroupDetail'
import AdminContact from './pages/AdminContact'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="app-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp"></div>
        </div>
      </div>
    )
  }
  return (
    <HelmetProvider>
      <Router>
        <div className="app-container">
          <Header session={session} />
          <main className="pb-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard session={session} />} />
              <Route path="/group/:id" element={<GroupDetail />} />
              <Route path="/admin-contact" element={<AdminContact />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  )
}

export default App
