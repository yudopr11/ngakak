# Ngakak - Bill Splitting Made Easy

Ngakak (Ngebagi, Gampang, Asyik, Kompak, Aman, Keren) is a modern bill splitting application that helps you split bills with friends easily and accurately.

## Features

- 📸 Upload bill images for automatic analysis
- 🤖 AI-powered item and price detection
- 💰 Automatic bill splitting calculation
- 📊 Clear breakdown of individual shares
- 💾 Save analysis results as images
- 🔒 Secure user authentication
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
- **Development Tools**:
  - ESLint for code quality
  - TypeScript for type safety
  - PostCSS for CSS processing

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
- `VITE_API_BASE_URL`: Your backend API URL
- `VITE_ALLOWED_HOST`: Your domain (e.g., ngakak.yourdomain.com)

4. Start development server
```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

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

## Deployment

The application is configured for deployment on Railway:

1. Create a new project on Railway
2. Connect your repository
3. Add required environment variables
4. Railway will automatically deploy your application

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
- [Railway](https://railway.app)
