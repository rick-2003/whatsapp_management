// App Configuration
export const APP_CONFIG = {
  // App Information
  name: "Future Minds Community Hub",
  description: "Connect with like-minded individuals in our diverse community groups",
  version: "1.0.0",
  logo: "/minds.png",
  
  // SEO & Meta
  keywords: "community, groups, future minds, networking, collaboration, chat groups",
  author: "Future Minds Team",
  
  // URLs
  baseUrl: import.meta.env.VITE_APP_URL || "http://localhost:5173",
    // Admin Contact Information
  admins: [
    {
      id: 1,
      name: "Alex Johnson",
      bio: "Lead community manager specializing in technology groups and educational initiatives. Passionate about connecting like-minded individuals.",
      department: "Community Management",
      whatsappNumber: "+1234567890",
      whatsappDeepLink: "https://wa.me/1234567890?text=Hello%20Alex,%20I%20need%20assistance%20with%20the%20community%20groups."
    },
    {
      id: 2,
      name: "Sarah Chen",
      bio: "Technical support specialist and group moderator. Expert in troubleshooting and maintaining community guidelines.",
      department: "Technical Support",
      whatsappNumber: "+1234567891",
      whatsappDeepLink: "https://wa.me/1234567891?text=Hello%20Sarah,%20I%20need%20technical%20assistance."
    },
    {
      id: 3,
      name: "Michael Rodriguez",
      bio: "Business development coordinator focusing on professional networking groups and career development communities.",
      department: "Business Development",
      whatsappNumber: "+1234567892",
      whatsappDeepLink: "https://wa.me/1234567892?text=Hello%20Michael,%20I%20have%20questions%20about%20business%20groups."
    }
  ],
  
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
    website: "https://futureminds.com"
  }
};

// Social Media Links
export const SOCIAL_LINKS = {
  whatsapp: "https://wa.me/1234567890",
  website: "https://futureminds.com",
  email: "mailto:contact@futureminds.com"
};

// Navigation Items
export const NAV_ITEMS = [
  { path: "/", label: "Home", icon: "Home" },
  { path: "/admin-contact", label: "Admin Contact", icon: "User" },
  { path: "/about", label: "About", icon: "Info" }
];