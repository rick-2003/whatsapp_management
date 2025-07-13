# FUTURE MINDS: Groups/Channel Management System

A mobile-first WhatsApp group management system built with React, Vite, Tailwind CSS, shadcn/ui, Lucide React icons, and Supabase. Users can browse and join WhatsApp groups, with a modern admin dashboard for managing listings and admin contact.

## 🚀 Features

### Public Features
- **Mobile-First Design**: Native mobile app-like experience
- **WhatsApp Group Directory**: Browse and join WhatsApp groups via direct links
- **Smart Search & Filtering**: Search and filter groups by name, category, or description
- **Group Details**: View group info, member count, and join status
- **Share Groups**: Share group links easily
- **Admin Contact**: Dedicated admin contact page with WhatsApp integration
- **SEO Optimized**: React Helmet for better search engine visibility

### Admin Features
- **Authentication**: Secure admin login via Supabase Auth
- **Group Management**: Add, edit, delete, and toggle group visibility
- **Dashboard Analytics**: View group and category stats
- **Admin Profile**: Centralized admin contact info
- **Media Support**: Add group images/logos
- **Member Count Tracking**: Track group member counts

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Backend**: Supabase (Database + Auth)
- **Routing**: React Router DOM
- **SEO**: React Helmet Async
- **Configuration**: Centralized app config
- **Deployment**: Vercel, Netlify, etc.

## 🎨 Design Features

- **Mobile-First**: Optimized for mobile devices
- **shadcn/ui Components**: All UI built with shadcn/ui for a clean, modern look
- **Minimalist & Slick**: Modern, minimalist design with focus on usability
- **Tailwind CSS**: Utility-first styling, responsive and semantic
- **Lucide Icons**: Crisp, modern iconography
- **Accessibility**: Semantic HTML and keyboard navigation support

## 📱 Mobile Optimization

- Maximum width of 480px for mobile app feel
- Touch-friendly buttons and interactions
- Optimized images and loading states
- Smooth scrolling and animations
- Responsive typography and spacing

## 🔒 Security

- Admin authentication via Supabase Auth
- Row Level Security (RLS) policies
- Environment variable protection
- Secure API endpoints
- Input validation and sanitization

## 🚀 Deployment

### Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please create an issue in the repository or contact the admin team.

---

# Original Vite/React Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
