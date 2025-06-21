# FUTURE MINDS: Community Hub

A mobile-first community group management system built with React, Vite, Tailwind CSS, and Supabase. This application allows users to browse and join community groups, with an admin panel for managing group listings and dedicated admin contact functionality.

## 🚀 Features

### Public Features
- **Mobile-First Design**: Native mobile app-like experience
- **Community Discovery**: Browse available community groups and channels
- **Smart Search**: Search groups by name or description
- **Category Filtering**: Filter groups by categories (Education, Technology, Business, etc.)
- **Group Details**: View detailed information about each group
- **Direct Join**: One-click join functionality with WhatsApp links
- **Share Groups**: Share group links with others
- **Admin Contact**: Dedicated admin contact page with bio and WhatsApp integration
- **SEO Optimized**: React Helmet for better search engine visibility

### Admin Features
- **Secure Authentication**: Admin login with Supabase Auth
- **Group Management**: Add, edit, delete, and toggle group visibility
- **Dashboard Analytics**: View statistics about groups and categories
- **Admin Profile**: Centralized admin contact information
- **Media Support**: Add group images and logos
- **Member Count Tracking**: Keep track of member counts

## 🛠️ Tech Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (Database + Authentication)
- **Routing**: React Router DOM
- **SEO**: React Helmet Async
- **Configuration**: Centralized app config
- **Deployment**: Ready for Vercel, Netlify, or similar platforms

## 🏗️ Database Schema

The application uses the following Supabase table structure:

### `groups` table
```sql
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  group_type VARCHAR(20) DEFAULT 'group',
  join_link TEXT NOT NULL,
  image_url TEXT,
  member_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd whatsapp-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up Supabase database**
   - Create the `groups` table using the schema above
   - Set up Row Level Security (RLS) policies
   - Create admin user accounts

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Supabase Setup

1. **Create the groups table** in your Supabase project
2. **Set up RLS policies**:
   - Allow public read access to active groups
   - Allow authenticated users (admins) full access
3. **Create admin accounts** through Supabase Auth

## 🎨 Design Features

- **Mobile-First**: Optimized for mobile devices with responsive design
- **Native App Feel**: Smooth animations and mobile-optimized interactions
- **WhatsApp Theme**: Color scheme inspired by WhatsApp branding
- **Clean UI**: Modern, minimalist design with focus on usability
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

For support or questions, please create an issue in the repository or contact the admin team.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
