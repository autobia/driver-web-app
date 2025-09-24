# Driver Web App 🚚

A modern web application for drivers to manage quality checks, deliveries, and logistics operations. Built with Next.js and TypeScript.

> **Note:** This application was rapidly developed with AI assistance to meet urgent business needs. While functional and production-ready, the codebase prioritizes speed of delivery over architectural perfection. Refactoring opportunities exist throughout for improved maintainability.

## 🚀 Features

### Core Functionality

- **Quality Check Management**: Complete inspection workflow for incoming goods
- **Order Delivery Tracking**: Manage sales orders and delivery documentation
- **Purchase Invoice Processing**: Handle supplier invoices and documentation
- **Trip Management**: Track and manage delivery trips
- **Multi-language Support**: Full internationalization (i18n) support
- **Role-based Access**: Different views for drivers vs other roles

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: Radix UI primitives
- **Authentication**: JWT with automatic refresh
- **Internationalization**: next-intl
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Forms**: Formik with Yup validation

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── login/             # Authentication page
│   ├── quality-checks/    # QC management
│   ├── orders-delivery/   # Sales order handling
│   ├── purchase-invoices/ # Invoice processing
│   └── trips/            # Trip management
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (buttons, dialogs, etc.)
│   ├── Navbar/           # Navigation components
│   └── ...
├── providers/            # Context and provider components
├── store/               # Redux store configuration
│   ├── api/            # RTK Query API endpoints
│   └── slices/         # Redux slices
├── lib/                # Utility functions
└── messages/          # i18n translation files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd driver-web-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_APP_URL=your_app_url
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Authentication Flow

The app uses JWT authentication with automatic token refresh:

1. User logs in with phone number and password
2. Tokens stored in Redux state
3. Axios interceptors handle token refresh automatically
4. Protected routes via AuthGuard component

## 🌍 Internationalization

The app supports multiple languages with dynamic switching:

- Translation files in `/src/messages/`
- Language switcher in navigation bar
- Persistent language preference

## 📱 Key Features by Role

### For Drivers

- Default landing on Trips page
- Access to delivery documentation
- Trip status management

### For QC Personnel

- Quality check ticket management
- Item inspection workflow
- Issue reporting (delays, replacements)
- Photo documentation

## ⚡ Performance Optimizations

- Turbopack for faster builds
- Code splitting at route level
- Optimized Redux selectors
- Lazy loading of components
- Efficient API caching with RTK Query

## 🎨 UI/UX Features

- Responsive design for mobile and desktop
- Loading states and skeleton screens
- Toast notifications for user feedback
- Smooth animations with Framer Motion
- Consistent design system with Tailwind

## ⚠️ Known Limitations

As this project was built rapidly with AI assistance, please note:

- Some components may have redundant code
- State management patterns could be more consistent
- Type definitions could be more strict in places
- Test coverage is minimal
- Some business logic is tightly coupled with UI components

Future refactoring should focus on:

- Extracting business logic to custom hooks
- Improving type safety
- Adding comprehensive test coverage
- Optimizing bundle size
- Implementing error boundaries

## 🤝 Contributing

When contributing, please:

1. Follow the existing code patterns
2. Use TypeScript strictly
3. Ensure mobile responsiveness
4. Test across different user roles
5. Update translations for new features

## 🙏 Acknowledgments

- Built with assistance from AI to meet urgent business requirements
- Designed for real-world logistics operations
- Optimized for driver and warehouse personnel workflows

---

_This application prioritizes functionality and rapid deployment. While the codebase may benefit from architectural improvements, it successfully serves its purpose in production environments._
