# Maison Royale Residency

A professional luxury apartment management system for Maison Royale Residency in Paris, managing 8 premium apartments near the Eiffel Tower.

## Features

- 🔐 **Secure Authentication** - Role-based access control (Admin & Manager)
- 📅 **Booking Management** - Complete booking system with conflict prevention
- 🏠 **Room Management** - Dynamic apartment management with 8 luxury units
- 👥 **Guest Database** - Comprehensive guest tracking and history
- 📊 **Advanced Reports** - Sales, occupancy, and performance analytics
- 🧾 **Receipt Generation** - Professional PDF receipts with WhatsApp sharing
- 💰 **Payment Tracking** - Cash and online payment methods
- 📱 **Mobile Responsive** - Optimized for all devices
- 🌓 **Light/Dark Theme** - Elegant theme switching
- 📥 **CSV Export** - Detailed data export functionality
- ✅ **Check-out System** - Streamlined departure management

## Tech Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Styling**: Tailwind CSS 4 + Material-UI
- **Backend**: Supabase (PostgreSQL)
- **Build Tool**: Vite 6
- **Package Manager**: pnpm
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/thepantherstudioslhr-creator/maison-royale-hotel.git
cd maison-royale-hotel
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Supabase database

Run the SQL scripts in your Supabase SQL Editor in this order:

1. `FRESH_SETUP.sql` - Creates all tables and schema
2. Insert default admin user (check SETUP_GUIDE.md for details)

### 5. Run development server

```bash
pnpm dev
```

Visit `http://localhost:5173` to see the app.

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/thepantherstudioslhr-creator/maison-royale-hotel)

### Manual Deployment

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `pnpm build`
     - **Output Directory**: `dist`
     - **Install Command**: `pnpm install`

3. **Add Environment Variables** in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Deploy!** Vercel will automatically build and deploy your app.

For detailed deployment troubleshooting, see [VERCEL_DEPLOYMENT_FIX.md](./VERCEL_DEPLOYMENT_FIX.md)

## The 8 Apartments

1. **Maison Eiffel Royale 10** - Premium unit
2. **Maison Eiffel View 11** - Eiffel Tower view
3. **Maison Seine Luxury 12** - Seine river facing
4. **Maison Champs Royal 13** - Champs-Élysées proximity
5. **Maison Louvre Elite 14** - Near Louvre Museum
6. **Maison Arc Premier 15** - Arc de Triomphe area
7. **Maison Trocadero Noble 16** - Trocadéro Gardens view
8. **Maison Marais Grand 17** - Le Marais district

## Default Credentials

**Admin Account:**
- Email: `admin@maisonroyale.com`
- Password: `Admin@123`

**Manager Account:**
- Email: `manager@maisonroyale.com`
- Password: `Manager@123`

> ⚠️ **Important**: Change these default passwords after first login!

## Project Structure

```
maison-royale-hotel/
├── src/
│   ├── app/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── imports/            # Static assets
│   └── styles/             # CSS and Tailwind styles
├── public/                 # Public assets
└── *.sql                   # Database setup scripts
```

## Documentation

- [Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Vercel Deployment Fix](./VERCEL_DEPLOYMENT_FIX.md)
- [Professional Upgrade Guide](./PROFESSIONAL_UPGRADE_GUIDE.md)
- [Mobile Installation Guide](./MOBILE_INSTALLATION_GUIDE.md)

## Features in Detail

### Booking Management
- Conflict detection and prevention
- Multi-night booking support
- Advance payment tracking
- Balance calculation
- Check-in/Check-out management

### Guest Database
- Complete guest profiles
- Booking history
- CNIC verification
- Contact information management

### Reporting
- Sales analytics
- Occupancy rates
- Revenue tracking
- Guest statistics
- Payment method breakdown
- Custom date range filters

### User Management (Admin Only)
- Create/edit users
- Role assignment (Admin/Manager)
- Permission management
- Activity tracking

## Support

For issues or questions:
- Check the documentation files in the repository
- Review [VERCEL_DEPLOYMENT_FIX.md](./VERCEL_DEPLOYMENT_FIX.md) for deployment issues
- Check Vercel deployment logs for build errors

## License

Private project - All rights reserved

---

Built with ❤️ for Maison Royale Residency
