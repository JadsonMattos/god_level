import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { SalesPage } from './pages/SalesPage'
import { DashboardPage } from './pages/DashboardPage'
import { ComparisonPage } from './pages/ComparisonPage'
import { DashboardBuilderPage } from './pages/DashboardBuilderPage'
import { CustomerAnalysisPage } from './pages/CustomerAnalysisPage'
import { AdvancedAnalyticsPage } from './pages/AdvancedAnalyticsPage'
import { SharedDashboardPage } from './pages/SharedDashboardPage'
import { LoginForm } from './components/LoginForm'
import { authApi } from './services/authApi'

type Page = 'dashboard' | 'sales' | 'comparison' | 'builder' | 'customers' | 'advanced'

const getNavButtonClass = (isActive: boolean) => `
  px-3 xl:px-4 py-2 rounded-md font-medium transition-colors text-sm xl:text-base
  ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}
`

const getMobileNavButtonClass = (isActive: boolean) => `
  px-4 py-2 rounded-md font-medium transition-colors text-left
  ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}
`

const handleMobileNavClick = (
  page: Page, 
  setCurrentPage: (page: Page) => void, 
  setMobileMenuOpen: (open: boolean) => void
) => {
  setCurrentPage(page)
  setMobileMenuOpen(false)
}

interface DesktopNavigationProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  handleLogout: () => void
}

function DesktopNavigation({ currentPage, setCurrentPage, handleLogout }: Readonly<DesktopNavigationProps>) {
  return (
    <nav className="hidden lg:flex gap-2 xl:gap-4 items-center">
      <button onClick={() => setCurrentPage('dashboard')} className={getNavButtonClass(currentPage === 'dashboard')}>
        Dashboard
      </button>
      <button onClick={() => setCurrentPage('comparison')} className={getNavButtonClass(currentPage === 'comparison')}>
        Comparação
      </button>
      <button onClick={() => setCurrentPage('builder')} className={getNavButtonClass(currentPage === 'builder')}>
        🛠️ Builder
      </button>
      <button onClick={() => setCurrentPage('customers')} className={getNavButtonClass(currentPage === 'customers')}>
        👥 Clientes
      </button>
      <button onClick={() => setCurrentPage('advanced')} className={getNavButtonClass(currentPage === 'advanced')}>
        🔍 Avançadas
      </button>
      <button onClick={() => setCurrentPage('sales')} className={getNavButtonClass(currentPage === 'sales')}>
        Vendas
      </button>
      <button onClick={handleLogout} className="px-3 xl:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 text-sm xl:text-base">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="hidden xl:inline">Sair</span>
      </button>
    </nav>
  )
}

interface MobileNavigationProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  handleLogout: () => void
  setMobileMenuOpen: (open: boolean) => void
}

function MobileNavigation({ currentPage, setCurrentPage, handleLogout, setMobileMenuOpen }: Readonly<MobileNavigationProps>) {
  return (
    <nav className="lg:hidden mt-4 pb-4 border-t pt-4">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleMobileNavClick('dashboard', setCurrentPage, setMobileMenuOpen)}
          className={getMobileNavButtonClass(currentPage === 'dashboard')}
        >
          Dashboard
        </button>
        <button
          onClick={() => handleMobileNavClick('comparison', setCurrentPage, setMobileMenuOpen)}
          className={getMobileNavButtonClass(currentPage === 'comparison')}
        >
          Comparação
        </button>
        <button
          onClick={() => handleMobileNavClick('builder', setCurrentPage, setMobileMenuOpen)}
          className={getMobileNavButtonClass(currentPage === 'builder')}
        >
          🛠️ Builder
        </button>
        <button
          onClick={() => handleMobileNavClick('customers', setCurrentPage, setMobileMenuOpen)}
          className={getMobileNavButtonClass(currentPage === 'customers')}
        >
          👥 Clientes
        </button>
        <button
          onClick={() => handleMobileNavClick('advanced', setCurrentPage, setMobileMenuOpen)}
          className={getMobileNavButtonClass(currentPage === 'advanced')}
        >
          🔍 Análises Avançadas
        </button>
        <button
          onClick={() => handleMobileNavClick('sales', setCurrentPage, setMobileMenuOpen)}
          className={getMobileNavButtonClass(currentPage === 'sales')}
        >
          Vendas
        </button>
        <button
          onClick={() => {
            handleLogout()
            setMobileMenuOpen(false)
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 text-left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>
    </nav>
  )
}

function AppContent() {
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check if we're on a shared dashboard route (no auth needed)
  const isSharedRoute = location.pathname.startsWith('/share/')

  useEffect(() => {
    // Skip auth check for shared routes
    if (isSharedRoute) {
      setIsAuthenticated(true)
      setCheckingAuth(false)
      return
    }

    // Check if user is already authenticated
    if (authApi.isAuthenticated()) {
      setIsAuthenticated(true)
    }
    setCheckingAuth(false)
  }, [isSharedRoute])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authApi.logout()
    setIsAuthenticated(false)
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // For shared routes, render directly without auth
  if (isSharedRoute) {
    return null // Routes will handle this
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                🍔 Analytics
              </h1>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
            
            <DesktopNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <MobileNavigation 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              handleLogout={handleLogout} 
              setMobileMenuOpen={setMobileMenuOpen} 
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="overflow-x-hidden w-full max-w-full">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'comparison' && <ComparisonPage />}
        {currentPage === 'builder' && <DashboardBuilderPage />}
        {currentPage === 'customers' && <CustomerAnalysisPage />}
        {currentPage === 'advanced' && <AdvancedAnalyticsPage />}
        {currentPage === 'sales' && <SalesPage />}
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/share/:shareToken" element={<SharedDashboardPage />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
