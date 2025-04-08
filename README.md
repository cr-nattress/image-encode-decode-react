# Image Encode Decode React with shadcn/ui

A React application for encoding and decoding images, enhanced with shadcn/ui components. This project demonstrates how to integrate shadcn/ui with Create React App using CRACO.

## Features

- Image encoding and decoding functionality
- Modern UI with shadcn/ui components
- Tailwind CSS integration
- CRACO configuration for CRA customization
- Betterstack logging integration for monitoring user interactions and application events

## shadcn/ui Integration

This project showcases the integration of shadcn/ui components in a Create React App project. The integration was done manually since shadcn/ui's CLI tools are primarily designed for Next.js and Vite.

Key integration points:
- CRACO for PostCSS configuration
- Tailwind CSS setup
- Manual component implementation
- Coexistence with SCSS styling system

For detailed implementation steps, see the [shadcn-implementation-guide.md](./research/shadcn-implementation-guide.md) in the research folder.

## Betterstack Logging Integration

This application includes integration with Betterstack for logging user interactions and application events. The logging system provides valuable insights into how users interact with the application and helps identify potential issues.

### Environment Variables

The Betterstack integration uses environment variables to configure the connection. Create a `.env` file in the root directory with the following variables:

```
# Betterstack logging configuration
REACT_APP_BETTERSTACK_SOURCE_ID=your_source_id
REACT_APP_BETTERSTACK_SOURCE_TOKEN=your_source_token
REACT_APP_BETTERSTACK_HOST=your_betterstack_host.betterstackdata.com

# Enable logging in development mode (true/false)
REACT_APP_ENABLE_LOGGING=false
```

A `.env.example` file is provided as a template. Copy this file to `.env` and replace the values with your own Betterstack credentials.

### Logged Events

The application logs the following types of events:

- Application initialization and closure
- User interactions (mode changes, file uploads, etc.)
- Image processing operations
- Errors and warnings

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and enhanced with CRACO for configuration overrides.

### Prerequisites

- Node.js 14.0 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/image-encode-decode-react-shadcn.git
cd image-encode-decode-react-shadcn

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env file with your Betterstack credentials

# Start the development server
npm start
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\  
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\  
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\  
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\  
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

For more information about shadcn/ui, visit [shadcn/ui documentation](https://ui.shadcn.com/).

For more information about Betterstack logging, visit [Betterstack documentation](https://betterstack.com/docs).
