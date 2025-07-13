import { ArrowLeft, Building } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { APP_CONFIG } from '../config/app';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

const AdminContact = () => {
  const { admins } = APP_CONFIG;

  const handleWhatsAppContact = (admin) => {
    window.open(admin.whatsappDeepLink, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>Admin Contact - {APP_CONFIG.name}</title>
        <meta name="description" content="Contact our community administrators for support and assistance" />
        <meta name="keywords" content="admin contact, community support, whatsapp admin, help" />
      </Helmet>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Admin Contact</h1>
            <p className="text-muted-foreground">Get in touch with our community administrators</p>
          </div>
        </div>

        {/* Team Overview */}
        <Card className="mb-8 text-center">
          <CardHeader>
            <Avatar className="mx-auto h-20 w-20 mb-4">
              <AvatarImage src={APP_CONFIG.logo} alt={APP_CONFIG.name} />
              <AvatarFallback>{APP_CONFIG.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-bold">Our Student Admin Team</CardTitle>
            <CardDescription>
              Our dedicated student administrators are here to help you with study groups,
              academic support, and peer learning opportunities.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Admin Cards */}
        <div className="flex flex-col gap-6">
          {admins.map((admin) => (
            <Card key={admin.id} className="text-center">
              <CardHeader className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={admin.avatar || APP_CONFIG.logo} alt={admin.name} />
                  <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-semibold">{admin.name}</CardTitle>
                <CardDescription className="flex items-center justify-center text-muted-foreground">
                  <Building className="mr-2 h-4 w-4" />
                  <span>{admin.department}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{admin.bio}</p>
                <Separator className="mb-4" />
                <Button
                  onClick={() => handleWhatsAppContact(admin)}
                  className="w-full bg-whatsapp hover:bg-whatsapp_dark"
                >
                  <WhatsAppIcon className="mr-2 h-4 w-4" />
                  Contact on WhatsApp
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminContact;
