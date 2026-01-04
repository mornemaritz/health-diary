# health-diary-ui


A React-based web application for tracking daily health and care activities.

## Features
The features for this app are currently specific to a use case of tracking health events and actions for a young child. The vision is to add features that enable the tracking of more extensive health events and actions for a broader range of subjects, and include, for example healthcare encounters and data derived from wearables.

### Current Features
- Track bottle feeds with time and volume
- Record medication administration
- Monitor solid food intake
- Log diaper changes
- Add daily notes
- Track sleep patterns

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

```bash
# Create production build
npm run build
```

## Build and publish container images
```bash
docker build -t health-diary-ui:{version} .
```
currently images are pushed to a local microk8s registry

## Technology Stack

- React
- TypeScript
- Material-UI (MUI)
- Moment.js
- Vite

## Project Structure

```
health-diary-ui/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/        # Page components
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── public/           # Static assets
└── package.json      # Project dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
