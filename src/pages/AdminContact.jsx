import { User, Building } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { APP_CONFIG } from '../config/app';
import WhatsAppIcon from '../components/WhatsAppIcon';

const AdminContact = () => {
  const { admins } = APP_CONFIG;

  const handleWhatsAppContact = (admin) => {
    window.open(admin.whatsappDeepLink, '_blank');
  };

  return (
    <>      <Helmet>
        <title>Admin Contact - {APP_CONFIG.name}</title>
        <meta name="description" content="Contact our community administrators for support and assistance" />
        <meta name="keywords" content="admin contact, community support, whatsapp admin, help" />
      </Helmet>      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src={APP_CONFIG.logo} 
              alt={APP_CONFIG.name} 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg"
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Contact</h1>
            <p className="text-gray-600">Get in touch with our community administrators</p>
          </div>          {/* Team Overview */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
            <h2 className="text-xl font-bold mb-2">Our Student Admin Team</h2>
            <p className="text-blue-100 text-sm">
              Our dedicated student administrators are here to help you with study groups, 
              academic support, and peer learning opportunities.
            </p>
          </div>          {/* Admin Cards */}
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin.id} className="bg-white rounded-2xl shadow-xl p-6">
                {/* Mobile-style Layout for All Screens */}
                <div className="flex flex-col gap-4">
                  {/* Profile Section */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{admin.name}</h2>
                    <div className="flex items-center justify-center text-gray-600 mb-2">
                      <Building className="w-4 h-4 mr-2" />
                      <span className="text-sm">{admin.department}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed text-sm mb-4">{admin.bio}</p>
                  </div>

                  {/* Contact Section */}
                  <div>                    <button
                      onClick={() => handleWhatsAppContact(admin)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl px-6 py-3 flex items-center justify-center space-x-2 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      <span className="font-semibold">Contact on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Back Navigation */}
          <div className="mt-8 text-center">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Community Hub
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminContact;
