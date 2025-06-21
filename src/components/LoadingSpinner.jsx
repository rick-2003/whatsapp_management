const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp"></div>
        <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-t-2 border-whatsapp_dark opacity-75" style={{ animationDelay: '0.1s' }}></div>
      </div>
    </div>
  )
}

export default LoadingSpinner
