// App Configuration
export const APP_CONFIG = {  // App Information
    name: "Group Name Community Hub",
    description: "Educational community connecting students across disciplines - for students, by students",
    version: "1.0.0",
    logo: "/image.png",

    // SEO & Meta
    keywords: "student community, educational groups, study groups, academic help, peer learning, student networking",
    author: "Student Community",
    // URLs
    baseUrl: import.meta.env.VITE_APP_URL || "https://your-community-hub.com",    // Admin Contact Information
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
    // Contact & Support
    support: {
        email: "support@your-community-hub.com",
        website: "https://your-community-hub.com"
    }
};

// Social Media Links
export const SOCIAL_LINKS = {
    whatsapp: "https://wa.me/1234567890",
    website: "https://your-community-hub.com",
    email: "mailto:contact@your-community-hub.com"
};

// Navigation Items
export const NAV_ITEMS = [
    { path: "/", label: "Home", icon: "Home" },
    { path: "/admin-contact", label: "Admin Contact", icon: "User" },
    { path: "/about", label: "About", icon: "Info" }
];