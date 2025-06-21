import { APP_CONFIG } from '../config/app'

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 p-8">
      <div className="relative mb-8">
        {/* App Logo with Enhanced Pulse Animation */}
        <div className="relative">
          <img 
            src={APP_CONFIG.logo} 
            alt={APP_CONFIG.name} 
            className="w-20 h-20 rounded-3xl shadow-2xl animate-pulse"
          />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-30 animate-ping"></div>
          <div className="absolute inset-2 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>
      
      {/* Enhanced Spinner */}
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-green-200"></div>
        <div className="absolute inset-0 animate-spin rounded-full h-14 w-14 border-t-4 border-green-500" style={{ animationDelay: '0.1s' }}></div>
        <div className="absolute inset-1 animate-spin rounded-full h-12 w-12 border-r-4 border-blue-500" style={{ animationDelay: '0.2s' }}></div>
      </div>
      
      {/* Loading Text */}
      <div className="text-center mb-6">
        <p className="text-gray-700 font-bold text-lg mb-2">Loading...</p>
        <p className="text-sm text-gray-500">Connecting to Future Minds Community</p>
      </div>
      
      {/* Enhanced Loading Dots Animation */}
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      </div>
    </div>
  )
}

export default LoadingSpinner
