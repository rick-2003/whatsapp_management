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
    baseUrl: import.meta.env.VITE_APP_URL || "https://mind-community.netlify.app",    // Admin Contact Information
    admins: [
        {
            id: 1,
            name: "Lorem Ipsum",
            bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            department: "Lorem Department - Final Year",
            whatsappNumber: "+911234567890"
        },
        {
            id: 2,
            name: "Dolor Amet",
            bio: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            department: "Consectetur Adipiscing - 3rd Year",
            whatsappNumber: "+912345678901"
        },
        {
            id: 3,
            name: "Consectetur Elit",
            bio: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            department: "Sed Eiusmod Tempor - 2nd Year",
            whatsappNumber: "+913456789012"
        }].map(admin => ({
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