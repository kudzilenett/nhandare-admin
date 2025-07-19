# 🏆 Nhandare Admin Panel

> **Administrative interface for the Nhandare gaming platform**

A powerful, modern web-based admin panel built with Next.js 14, TypeScript, and Tailwind CSS for managing the Nhandare gaming platform.

## 🚀 Features

- **🔐 Secure Authentication** - JWT-based authentication with role-based access control
- **📊 Real-time Dashboard** - Live statistics and platform overview
- **🏆 Tournament Management** - Complete CRUD operations for tournaments
- **👥 User Administration** - User management and analytics
- **💳 Payment Monitoring** - Transaction tracking and management
- **📈 Analytics & Reporting** - Comprehensive platform insights
- **⚙️ System Configuration** - Platform settings and configuration
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🎨 Modern UI** - Clean, professional interface with dark mode support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: React Context + React Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts (coming soon)

## 📦 Installation

1. **Clone the repository**

   ```bash
   cd nhandare-admin
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your configuration:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
   NEXT_PUBLIC_ADMIN_TITLE=Nhandare Admin Panel
   NEXT_PUBLIC_ADMIN_VERSION=1.0.0
   ```

4. **Start the development server**

```bash
npm run dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   │   ├── dashboard/     # Dashboard overview
│   │   ├── tournaments/   # Tournament management
│   │   ├── users/         # User administration
│   │   ├── payments/      # Payment monitoring
│   │   ├── analytics/     # Analytics & reporting
│   │   └── settings/      # System configuration
│   ├── login/             # Authentication page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   └── ui/               # Generic UI components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── services/             # API services
├── types/                # TypeScript type definitions
└── utils/                # Helper utilities
```

## 🔐 Authentication

The admin panel uses JWT-based authentication with the following features:

- **Secure Login**: Email/password authentication
- **Token Management**: Automatic token refresh
- **Role-Based Access**: Different permissions for different admin roles
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Session Persistence**: Tokens stored securely in localStorage

### Admin Roles

- **Super Admin**: Full system access
- **Admin**: Tournament and user management
- **Moderator**: Content moderation
- **Support**: Read-only access

## 🎨 Design System

The admin panel follows a professional, data-focused design philosophy:

- **Color Palette**: Professional grays with accent colors for status indicators
- **Typography**: Inter font family for optimal readability
- **Layout**: Clean, organized interface optimized for desktop use
- **Components**: Consistent design patterns across all interfaces
- **Accessibility**: WCAG 2.1 AA compliance

## 📊 Dashboard Features

- **Real-time Statistics**: Live platform metrics
- **Activity Feed**: Recent system events
- **Quick Actions**: Common admin tasks
- **System Health**: Platform status monitoring
- **Performance Metrics**: Response times and uptime

## 🏆 Tournament Management

- **Tournament CRUD**: Create, read, update, delete tournaments
- **Participant Management**: Add/remove participants
- **Bracket Management**: Interactive tournament brackets
- **Status Tracking**: Real-time tournament progress
- **Results Management**: Override and manage match outcomes

## 👥 User Administration

- **User Listing**: Advanced search and filtering
- **Profile Management**: Edit user information
- **Account Status**: Activate/deactivate/ban users
- **Role Assignment**: Assign admin/moderator roles
- **Activity Tracking**: User engagement metrics

## 💳 Payment Management

- **Transaction Monitoring**: View all payment transactions
- **Status Management**: Update payment statuses
- **Refund Processing**: Handle refunds and disputes
- **Payment Analytics**: Revenue and method analysis
- **Financial Reports**: Comprehensive financial data

## 📈 Analytics & Reporting

- **User Analytics**: Growth, engagement, and retention
- **Tournament Analytics**: Participation and performance
- **Financial Analytics**: Revenue trends and projections
- **System Analytics**: Performance and health metrics
- **Custom Reports**: Build and schedule custom reports

## 🚀 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Style

- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Conventional Commits**: Standardized commit messages

### Testing

```bash
# Unit tests (coming soon)
npm run test

# E2E tests (coming soon)
npm run test:e2e
```

## 🔧 Configuration

### Environment Variables

| Variable                    | Description         | Default                 |
| --------------------------- | ------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`       | Backend API URL     | `http://localhost:3001` |
| `NEXT_PUBLIC_WEBSOCKET_URL` | WebSocket URL       | `ws://localhost:3001`   |
| `NEXT_PUBLIC_ADMIN_TITLE`   | Admin panel title   | `Nhandare Admin Panel`  |
| `NEXT_PUBLIC_ADMIN_VERSION` | Admin panel version | `1.0.0`                 |

### Tailwind Configuration

The admin panel uses a custom Tailwind configuration with:

- **Custom Colors**: Admin-specific color palette
- **Custom Fonts**: Inter and JetBrains Mono
- **Custom Animations**: Fade-in and slide-up effects
- **Form Styling**: Enhanced form components

## 📱 Responsive Design

The admin panel is fully responsive and optimized for:

- **Desktop**: Primary interface with full sidebar navigation
- **Tablet**: Collapsible sidebar with touch-friendly controls
- **Mobile**: Mobile-first design with hamburger menu

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permissions system
- **Protected Routes**: Automatic authentication checks
- **Input Validation**: Zod schema validation
- **XSS Protection**: Sanitized inputs and outputs
- **CSRF Protection**: Built-in Next.js protection

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment**: Set environment variables in Vercel dashboard
3. **Deploy**: Automatic deployments on push to main branch

### Other Platforms

The admin panel can be deployed to any platform that supports Next.js:

- **Netlify**: Static site generation
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment
- **Self-hosted**: Traditional server deployment

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check the implementation plan in `/docs/`
- **Issues**: Create an issue on GitHub
- **Email**: Contact the development team

## 🗺️ Roadmap

### Phase 1: Foundation ✅

- [x] Project setup and authentication
- [x] Basic dashboard and navigation
- [x] Protected routes and layouts

### Phase 2: Core Features 🚧

- [ ] Tournament management interface
- [ ] User administration
- [ ] Payment monitoring
- [ ] Real-time updates

### Phase 3: Advanced Features 📋

- [ ] Analytics and reporting
- [ ] Content moderation
- [ ] System configuration
- [ ] Advanced automation

### Phase 4: Polish & Launch 📋

- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation
- [ ] Production deployment

---

**Built with ❤️ for the Nhandare gaming platform**
