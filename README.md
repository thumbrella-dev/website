# Thumbrella Web

Welcome to the Thumbrella Web project! This is a SaaS-style marketing website focused on providing developers with comprehensive information about Thumbrella, its features, and documentation.

## Project Structure

The project is organized as follows:

```
thumbrella-web
├── src
│   ├── components          # Reusable components for the site
│   │   ├── FeatureCards.astro
│   │   ├── Hero.astro
│   │   ├── Navbar.astro
│   │   └── Section.astro
│   ├── layouts             # Layout components for page structure
│   │   └── MainLayout.astro
│   ├── pages               # Pages of the website
│   │   ├── index.astro
│   │   ├── what-is-thumbrella.astro
│   │   ├── features.astro
│   │   ├── media-lib-browser.astro
│   │   └── docs
│   │       ├── web-client.astro
│   │       └── hosting.astro
│   └── styles              # Global styles for the website
│       └── global.css
├── public                  # Public assets
│   └── robots.txt
├── astro.config.mjs       # Astro framework configuration
├── package.json           # npm configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## Features

- **What is Thumbrella?**: A dedicated page explaining the purpose and benefits of Thumbrella.
- **Feature Highlights**: A visually appealing section showcasing the key features of Thumbrella through feature cards.
- **Live Media-Lib Browser**: An interactive page demonstrating the functionality of the media-lib browser.
- **Web Client Documentation**: Comprehensive documentation for developers on how to use the web client effectively.
- **Hosting Documentation**: Guidelines on how to host applications using Thumbrella.

## Getting Started

To get started with the Thumbrella Web project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd thumbrella-web
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000` to see the site in action.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.