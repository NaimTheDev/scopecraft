# ScopeCraft

ScopeCraft is a comprehensive project estimation tool designed to help developers, agencies, and freelancers create accurate project estimates quickly and efficiently. Built with modern web technologies, ScopeCraft streamlines the estimation process from initial client requirements to professional PDF proposals.

## Features

- **Interactive Estimation Wizard**: Step-by-step form to capture project requirements
- **Feature Library**: Pre-built library of common development features with estimated time requirements
- **AI-Powered Estimates**: Integration with OpenAI to generate intelligent project estimates
- **Professional PDF Generation**: Export estimates as professional PDF proposals
- **Project Dashboard**: Manage and track all your project estimates in one place
- **User Authentication**: Secure login with Firebase Authentication (including anonymous access)
- **Real-time Data**: Cloud storage with Firebase Firestore for seamless data management
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Customizable Settings**: Configure hourly rates and other estimation parameters

## Screenshots

### Generated Project Estimate PDF
<img width="472" height="845" alt="Screenshot 2025-07-26 at 1 19 13 PM" src="https://github.com/user-attachments/assets/9d240617-edab-40a4-ad17-4f9a10f7f035">

### Estimate Summary Interface
![image2](image2)

### Feature Selection Interface
![image3](image3)

### Dashboard with Project Estimates
![image4](image4)

## Tech Stack

- **Frontend**: React 18, Remix, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **PDF Generation**: @react-pdf/renderer
- **AI Integration**: OpenAI API
- **State Management**: Zustand
- **Build Tool**: Vite
- **Deployment**: Node.js compatible

## Installation and Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/NaimTheDev/scopecraft.git
   cd scopecraft
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with your Firebase and OpenAI credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Firestore and Authentication
   - Add your web app configuration to the environment variables

## Development

Run the development server:

```sh
npm run dev
```

This starts the ScopeCraft development server on `http://localhost:5173` with hot reloading enabled.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## Usage

1. **Authentication**: Sign up for an account or use anonymous access
2. **Create New Estimate**: Click "New Estimate" to start the estimation wizard
3. **Fill Project Details**: Complete the multi-step form:
   - Client request and project description
   - Project type selection
   - Feature selection from the library
   - Timeline requirements
   - Budget considerations and notes
4. **Generate Estimate**: AI-powered estimation creates detailed project breakdown
5. **Review & Export**: View the estimate summary and export as PDF
6. **Manage Projects**: Access all estimates from the dashboard

## Deployment

### Build for Production

```sh
npm run build
```

### Deploy to Production

```sh
npm start
```

The built application includes:
- `build/server` - Server-side code
- `build/client` - Client-side assets

### Deployment Options

ScopeCraft can be deployed to any Node.js hosting platform:

- **Vercel**: Zero-config deployment with automatic builds
- **Netlify**: JAMstack deployment with serverless functions
- **Railway**: Simple railway.app deployment
- **DigitalOcean App Platform**: Container-based deployment
- **Traditional VPS**: Any server with Node.js support

Make sure to set your environment variables in your hosting platform's configuration.

## Firebase Configuration

ScopeCraft requires Firebase for:
- **Authentication**: User login and anonymous access
- **Firestore**: Project data storage
- **Security Rules**: Configure appropriate read/write permissions

Ensure your Firestore security rules allow authenticated users to read/write their own data.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.
