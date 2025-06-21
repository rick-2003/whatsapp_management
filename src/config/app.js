// App Configuration
export const APP_CONFIG = {  // App Information
  name: "Future Minds Community Hub",
  description: "Educational community connecting students across disciplines - for students, by students",
  version: "1.0.0",
  logo: "/minds.png",
  
  // SEO & Meta
  keywords: "student community, educational groups, study groups, academic help, peer learning, student networking",
  author: "Future Minds Student Community",
    // URLs
  baseUrl: import.meta.env.VITE_APP_URL || "https://mind-community.netlify.app",  // Admin Contact Information
  admins: [
    {
      id: 1,
      name: "Priya Sharma",
      bio: "Computer Science student and community leader. Helps with academic groups, study sessions, and tech-related discussions.",
      department: "Computer Science - Final Year",
      whatsappNumber: "+919876543210"
    },
    {
      id: 2,
      name: "Rahul Kumar",
      bio: "Engineering student specializing in student support and peer mentoring. Available for technical doubts and project guidance.",
      department: "Electronics Engineering - 3rd Year",
      whatsappNumber: "+919876543211"
    },
    {
      id: 3,
      name: "Ananya Patel",
      bio: "Business student and community organizer. Helps with career guidance, internship groups, and networking opportunities.",
      department: "Business Administration - 2nd Year",
      whatsappNumber: "+919876543212"
    }  ].map(admin => ({
    ...admin,
    whatsappDeepLink: `https://wa.me/${admin.whatsappNumber.replace('+', '')}?text=Hi%20${admin.name.split(' ')[0]}`
  })),
  
  // App Theme Colors
  colors: {
    primary: "#25D366", // WhatsApp green
    secondary: "#128C7E",
    accent: "#075E54",
    background: "#f8fafc",
    surface: "#ffffff"
  },
    // Contact & Support
  support: {
    email: "support@futureminds.com",
    website: "https://mind-community.netlify.app"
  }
};

// Social Media Links
export const SOCIAL_LINKS = {
  whatsapp: "https://wa.me/1234567890",
  website: "https://mind-community.netlify.app",
  email: "mailto:contact@futureminds.com"
};

// Navigation Items
export const NAV_ITEMS = [
  { path: "/", label: "Home", icon: "Home" },
  { path: "/admin-contact", label: "Admin Contact", icon: "User" },
  { path: "/about", label: "About", icon: "Info" }
];