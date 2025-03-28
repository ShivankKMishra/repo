# Local Artisan Support Platform

A comprehensive web platform connecting local artisans with customers, supporting traditional craftsmanship through digital tools.

## Key Features

- Artisan profiles and product showcases
- Community forum for discussions
- Event promotion and discovery
- Newsletter subscription
- Secure authentication and user management

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based auth
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel serverless functions

## Deployment Instructions

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. A PostgreSQL database (can be hosted on [Neon](https://neon.tech), [Supabase](https://supabase.com), or any other provider)

### Environment Variables

Set up the following environment variables on Vercel:

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `NODE_ENV`: Set to `production` for production deployments

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
3. Deploy!

Vercel will automatically use the configuration in `vercel.json` to route API requests to the serverless functions.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (create a `.env` file)
4. Start the development server: `npm run dev`

## API Routes

The API follows a RESTful structure:

- `/api/auth/*` - Authentication endpoints
- `/api/products/*` - Product management
- `/api/categories/*` - Category management
- `/api/artisans/*` - Artisan profile management
- `/api/events/*` - Event management
- `/api/forum/*` - Community forum
- `/api/newsletter/*` - Newsletter subscriptions

## License

MIT