# Granboard App

A modern, feature-rich web application for Granboard electronic dartboards, built with Next.js and Web Bluetooth API.

[![CI/CD](https://github.com/bastiennoel93/granboard-app/actions/workflows/ci.yml/badge.svg)](https://github.com/bastiennoel93/granboard-app/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## Features

### Available Game Modes

- **Cricket**
  - Standard Cricket gameplay
  - Cut-throat mode
  - Player order selection (random, throw for order, manual)
  - Real-time scoreboard with marks tracking
  - MPR (Marks Per Round) statistics
  - Undo functionality
  - Game history tracking

### Coming Soon

- **01 Games** - Classic countdown games (301, 501, etc.)
- **Practice Mode** - Training exercises and skill development
- **Party Mode** - Fun casual game variants
- **Match Mode** - Competitive tournament play
- **AI Mode** - Play against computer opponents

### Core Features

- **Web Bluetooth Integration** - Direct connection to Granboard devices
- **Real-time Scoring** - Instant dart detection and scoring
- **Responsive Design** - Works on desktop and mobile devices
- **Modern UI** - Clean, intuitive interface with Tailwind CSS
- **Type Safety** - Full TypeScript implementation
- **Comprehensive Testing** - Unit tests and E2E tests with Playwright

## Prerequisites

- **Node.js** 18.x or higher
- **pnpm** package manager
- **Granboard** electronic dartboard (3, 3s, or 132 model)
- **Modern Browser** with Web Bluetooth support (Chrome, Edge, or Opera)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/bastiennoel93/granboard-app.git
cd granboard-app
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:8080](http://localhost:8080) in your browser

## Usage

### Connecting to Granboard

1. Click on your desired game mode (e.g., Cricket)
2. Click the "Connect to Board" button
3. Select your Granboard device from the browser's Bluetooth pairing dialog
4. Start playing!

### Playing Cricket

1. Select Cricket from the home screen
2. Add players
3. Choose player order:
   - **Random** - Automatic shuffle
   - **Throw for order** - Each player throws, highest score goes first
   - **Manual** - Arrange players manually
   - **Current order** - Keep the order players were added
4. Connect your Granboard
5. Throw darts and watch the scores update automatically!

## Development

### Project Structure

```
granboard-app/
├── app/                      # Next.js app directory
│   ├── components/          # Shared components
│   ├── cricket/            # Cricket game module
│   │   ├── components/     # Cricket-specific components
│   │   └── game/          # Game logic and hooks
│   └── page.tsx           # Home page
├── services/               # Business logic
│   ├── granboard.ts       # Bluetooth connection service
│   ├── cricket.ts         # Cricket game logic
│   └── boardinfo.ts       # Segment definitions
├── __tests__/             # Unit tests
├── e2e/                   # E2E tests
└── public/                # Static assets
```

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run unit tests in watch mode
pnpm test:coverage    # Generate coverage report
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI
pnpm test:e2e:debug   # Debug E2E tests
```

### Key Technologies

- **Framework:** [Next.js 14](https://nextjs.org/) - React framework with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Bluetooth:** [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) - Direct device communication
- **Testing:** [Jest](https://jestjs.io/) + [Playwright](https://playwright.dev/) - Unit and E2E testing
- **CI/CD:** [GitHub Actions](https://github.com/features/actions) - Automated testing and deployment

### Web Bluetooth API

This app requires a browser with Web Bluetooth support:

- ✅ Chrome (Desktop & Android)
- ✅ Edge (Desktop)
- ✅ Opera (Desktop & Android)
- ❌ Firefox (not supported)
- ❌ Safari (not supported)

**Note:** HTTPS or localhost is required for Web Bluetooth to work.

## Testing

### Unit Tests

Unit tests are located in the `__tests__` directory and test individual components and services.

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
```

### E2E Tests

End-to-end tests are located in the `e2e` directory and test complete user workflows.

```bash
pnpm test:e2e          # Run all E2E tests
pnpm test:e2e:ui       # Interactive UI mode
pnpm test:e2e:debug    # Debug mode
```

## Roadmap

- [ ] Add 01 game modes (301, 501, 701)
- [ ] Implement practice mode with training exercises
- [ ] Add party games (Shanghai, Around the Clock, etc.)
- [ ] Create match mode for tournaments
- [ ] Build AI opponent system
- [ ] Add player profiles and statistics tracking
- [ ] Implement game replay functionality
- [ ] Add sound effects and animations
- [x] Support for multiple languages
- [ ] Dark/light theme toggle

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test && pnpm test:e2e`)
5. Run linter (`pnpm lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration provided
- Write tests for new features
- Keep components small and focused
- Use meaningful variable and function names

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Granboard](https://www.gran-darts.com/) for creating amazing electronic dartboards
- The Next.js team for an excellent React framework
- All contributors who help improve this project

## Support

If you encounter any issues or have questions:

- Open an [issue](https://github.com/bastiennoel93/granboard-app/issues)
- Check existing issues for solutions
- Review the [Web Bluetooth API documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)

---

**Made with ❤️ by the Granboard community**
