# Ngakak - Bill Splitting Made Easy

Ngakak (Ngebagi, Gampang, Asyik, Kompak, Aman, Keren) is a modern web application that helps you split bills fairly and efficiently. Using AI-powered receipt analysis, Ngakak can automatically detect items, calculate individual shares, and handle additional charges like VAT and service fees.

## Features

- 📸 **AI Receipt Analysis**: Upload a photo of your receipt and let our AI handle the calculations
- 🧮 **Smart Bill Splitting**: Automatically splits bills including VAT, service charges, and discounts
- 👥 **Multi-person Support**: Split bills between any number of people
- 🔒 **Secure Authentication**: Protected routes and API endpoints
- 💫 **Modern UI/UX**: Responsive design with smooth animations and transitions
- 🌙 **Dark Mode**: Easy on the eyes with a dark theme

## Tech Stack

- **Frontend**:
  - React 18 with TypeScript
  - React Router for navigation
  - Tailwind CSS for styling
  - Headless UI & Heroicons for components
  - React Hot Toast for notifications
  - React Dropzone for file uploads

- **Build Tools**:
  - Vite for development and building
  - PostCSS for CSS processing
  - ESLint for code quality

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API service running (see API setup below)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ngakak.git
   cd ngakak
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API endpoint:
   ```
   VITE_API_BASE_URL=http://your-api-endpoint
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deployment

#### Railway Deployment

This project includes configuration for easy deployment to [Railway](https://railway.app):

1. Fork this repository to your GitHub account
2. Create a new project in Railway
3. Connect your GitHub repository
4. Add the following environment variables in Railway:
   - `VITE_API_BASE_URL`: Your backend API URL
   - `VITE_ALLOWED_HOST`: Your custom domain (e.g., ngakak.yudopr.dev)
   - Any other environment variables required by your app
5. Railway will automatically deploy your application

The deployment configuration is defined in `railway.json` and includes:
- Automatic builds using Nixpacks
- Health checks and automatic restarts
- Production-ready server configuration

You can also deploy manually using the Railway CLI:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to your Railway account
railway login

# Link to your Railway project
railway link

# Deploy your application
railway up
```

## API Integration

The application expects the following API endpoints:

- `POST /auth/login`: Authentication endpoint
- `POST /splitbill/analyze`: Bill analysis endpoint

See the API documentation for detailed request/response formats.

## Project Structure

```
src/
├── components/          # React components
│   ├── BillSplitter.tsx    # Main bill splitting component
│   ├── CurrencyDisplay.tsx # Currency formatting component
│   ├── Login.tsx          # Authentication component
│   └── Navbar.tsx         # Navigation component
├── services/           # API and auth services
│   ├── api.ts         # API integration
│   └── auth.ts        # Authentication logic
├── App.tsx            # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Headless UI](https://headlessui.dev/)
- [Railway](https://railway.app)
