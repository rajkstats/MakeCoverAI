
# MakeCover - AI-Powered Blog Cover Image Generator

MakeCover is a web application that generates professional blog cover images using AI. Built with React, Express, and the Fireworks AI API.

## Features

- AI-powered image generation from text descriptions
- Style recommendation system
- Multiple design styles (modern, minimal, bold, tech, creative)
- Real-time preview
- Custom color selection
- Professional typography options

## Tech Stack

- Frontend: React, TailwindCSS, Shadcn/UI
- Backend: Express.js, TypeScript
- AI: Fireworks AI API
- State Management: TanStack Query

## Getting Started

1. Clone this Repl
2. Add your Fireworks API key to the Secrets tool with the key `FIREWORKS_API_KEY`
3. Install dependencies:
```bash
npm install
```
4. Start the development server:
```bash
npm run dev
```

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend API
- `/db` - Database configuration and schema
- `/components` - Reusable UI components
- `/lib` - Utility functions and API clients

## Environment Variables

Required environment variables:
- `FIREWORKS_API_KEY` - Your Fireworks AI API key

## Development

To run the project in development mode:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

## License

MIT License
