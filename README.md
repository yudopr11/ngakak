# Ngakak - Bill Splitting Made Easy

Ngakak (Ngebagi, Gampang, Asyik, Kompak, Aman, Keren) is a modern bill splitting application that helps you split bills with friends easily and accurately.

## Features

- 📸 Upload bill images for automatic analysis
- 🤖 AI-powered item and price detection
- 💰 Automatic bill splitting calculation
- 📊 Clear breakdown of individual shares
- 💾 Save analysis results as images
- 🔒 Secure user authentication with JWT tokens encrypted via AES
- 🎨 Modern dark-themed UI for reduced eye strain
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **UI Components**: 
  - Headless UI for accessible components
  - Heroicons for beautiful icons
- **Image Processing**: html2canvas for analysis export
- **State Management**: React Hooks
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Security**:
  - CryptoJS for token encryption
  - AES-256 encryption for token storage
  - Environment variable based encryption keys
- **Notifications**: React Hot Toast
- **Development Tools**:
  - ESLint for code quality
  - TypeScript for type safety
  - PostCSS for CSS processing

## UI Design

Ngakak features a modern, dark-themed UI with a sleek gradient background that reduces eye strain during extended use. The interface uses a carefully designed color scheme with:

- Deep navy/black background (#0E1520) for the application
- Slightly lighter card backgrounds (#131E2C) for content
- Blue primary accents for interactive elements
- Subtle grid patterns for visual interest without distraction

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/ngakak.git
cd ngakak
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
- `VITE_API_BASE_URL`: Your backend API URL (e.g., http://localhost:8000)
- `VITE_ALLOWED_HOST`: Your domain (e.g., http://localhost:3000)
- `VITE_ENCRYPTION_KEY`: A strong encryption key for token storage

### Generating a Secure Encryption Key

For production deployment, generate a strong encryption key. You can use Node.js crypto module:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated key to your `.env` file as `VITE_ENCRYPTION_KEY`.

4. Start development server
```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` file to version control
   - Use different encryption keys for development and production
   - Keep your production encryption key secure

2. **Token Storage**
   - JWT tokens are encrypted using AES before storage in localStorage
   - Tokens are automatically decrypted when making API requests
   - Failed encryption/decryption is logged with fallback behavior
   - Error handling provides security-related feedback without exposing sensitive details

3. **Authentication**
   - Axios interceptors automatically handle authentication and refresh tokens
   - Toast notifications for authentication errors with appropriate error messages
   - Automatic redirection for expired sessions

## Project Structure

```
ngakak/
├── public/                # Static assets
│   └── favicon.svg       # Application favicon
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── BillAnalysis.tsx    # Bill analysis display
│   │   ├── BillSplitter.tsx    # Main bill splitting component
│   │   ├── CurrencyDisplay.tsx # Currency formatting component
│   │   ├── ImageUploader.tsx   # Image upload component
│   │   ├── Login.tsx          # Authentication component
│   │   └── Navbar.tsx         # Navigation component
│   ├── services/         # API and services
│   │   ├── api.ts           # API integration
│   │   ├── auth.ts          # Authentication logic
│   │   ├── encryption.ts    # Token encryption/decryption
│   │   └── axiosConfig.ts   # Axios configuration
│   ├── App.tsx          # Main application component
│   ├── env.d.ts         # Environment type definitions
│   ├── index.css        # Global styles
│   └── main.tsx         # Application entry point
├── .env.example         # Example environment variables
├── .gitattributes       # Git attributes configuration
├── .gitignore           # Git ignore configuration
├── index.html           # HTML entry point
├── package.json         # Project dependencies and scripts
├── postcss.config.js    # PostCSS configuration
├── railway.json         # Railway deployment configuration
├── README.md           # Project documentation
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Deployment to Railway

1. **Railway Setup**

- Create an account on [Railway](https://railway.app)
- Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Initialize Railway Project**
```bash
railway init
```

4. **Configure Environment Variables**
- Go to Railway Dashboard
- Add all environment variables from `.env`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Created by [yudopr](https://github.com/yudopr11)
- Built with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/)
- Deploy with [Railway](https://railway.app)
