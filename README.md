# 🐾 Stray Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

> A community-driven Progressive Web App for tracking and helping stray animals in neighborhoods. Empower your community to take collective action in caring for stray cats and dogs through real-time tracking, collaborative care coordination, and gamified engagement.

## 🌟 Features

### Core Functionality

- **🐕 Animal Profiles**: Create detailed profiles for stray animals with photos, locations, and care history
- **📍 Real-time Tracking**: GPS-based sighting reports with location mapping and status updates
- **👥 Community Feed**: Share sightings, updates, and coordinate care efforts with neighbors
- **📱 Progressive Web App**: Install on any device with offline support and push notifications

### Community Engagement

- **🏷️ Collaborative Naming**: Community-driven naming with democratic voting system
- **📢 Smart Notifications**: Subscribe to specific animals or locations with customizable alerts
- **🎯 Location Tracking Requests**: Request community help for specific areas or animals
- **🌐 Social Sharing**: Share animal profiles and success stories on social media

### Advanced Features

- **⚡ Real-time Updates**: Live notifications and feed updates using WebSockets
- **🔍 Advanced Search**: Filter by location, animal type, status, and other criteria
- **📊 Community Impact**: Track collective impact and success metrics
- **🎮 Gamification**: Achievement system and community challenges

## 🚀 Tech Stack

### Frontend

- **React 18** - Modern React with concurrent features
- **TanStack Start** - Full-stack React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS + shadcn/ui** - Beautiful, accessible UI components
- **TanStack Router** - Type-safe routing with file-based routes
- **TanStack Query** - Powerful data synchronization and caching

### Backend & Infrastructure

- **Cloudflare Workers** - Serverless edge computing
- **Cloudflare D1** - Serverless SQLite database
- **Cloudflare R2** - Object storage for images and files
- **Cloudflare KV** - Key-value storage for caching

### Authentication & Security

- **OAuth 2.0** - Google, Facebook, and Instagram integration
- **JWT** - Secure API authentication
- **Cloudflare Access** - Identity and access management

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js 18+**
- **pnpm** (recommended) or **npm**
- **Cloudflare account** with Workers & Pages enabled

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd stray-tracker

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start development server
pnpm dev

# Start Cloudflare Workers locally
pnpm wrangler dev
```

### Environment Configuration

Create a `.env.local` file with:

```env
# Local Development
VITE_API_URL=http://localhost:8787
VITE_APP_URL=http://localhost:3000

# Cloudflare Configuration
CF_API_TOKEN=your_api_token
CF_ACCOUNT_ID=your_account_id

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
INSTAGRAM_CLIENT_ID=your_instagram_client_id

# Database
DATABASE_URL=your_database_url

# Storage
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
```

## 🌐 Deployment

### Production Deployment

```bash
# Build and deploy to Cloudflare Pages
pnpm build
pnpm deploy

# Deploy Workers
pnpm wrangler deploy
```

The application is automatically deployed to Cloudflare's global edge network for optimal performance worldwide.

## 📖 Usage

### Getting Started

1. **Sign Up**: Create an account using Google, Facebook, or Instagram
2. **Explore**: Browse the community feed to see recent animal sightings
3. **Report**: Add a new animal sighting with photos and location
4. **Engage**: Subscribe to animals or locations you're interested in
5. **Help**: Participate in community challenges and collaborative naming

### Community Guidelines

- Be respectful and kind to all community members
- Only report genuine animal sightings
- Respect animal welfare and local regulations
- Use photos responsibly and respect privacy
- Help moderate content by reporting inappropriate posts

## 🔧 Development

### Project Structure

```
stray-tracker/
├── docs/                    # Documentation
│   ├── architecture.md     # System architecture
│   ├── product_requirement_docs.md  # PRD
│   └── technical.md        # Technical documentation
├── src/                    # Source code
│   ├── components/         # React components
│   ├── routes/            # File-based routing
│   ├── lib/               # Utility libraries
│   └── utils/             # Helper functions
├── public/                # Static assets
├── db/                   # Database files
└── tasks/                # Project tasks and context
```

### Key Technologies Explained

- **TanStack Ecosystem**: Unified tooling for routing, querying, and data management
- **Cloudflare Workers**: Serverless functions running at the edge
- **Progressive Web App**: Native app experience on any device
- **Real-time Features**: Live updates using WebSockets and edge computing

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Bug Reports**: Found a bug? Let us know!
- 💡 **Feature Requests**: Have ideas for new features?
- 📝 **Documentation**: Help improve our docs
- 🧪 **Testing**: Help test new features
- 💻 **Code**: Submit pull requests with improvements

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Run the test suite (`pnpm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (ESLint + Prettier configured)
- Write meaningful commit messages
- Add JSDoc comments for functions
- Update documentation for new features

## 📄 API Documentation

### Core Endpoints

- `GET /api/animals` - List animals with filtering
- `POST /api/animals` - Create new animal profile
- `GET /api/sightings` - Get recent sightings
- `POST /api/sightings` - Report new sighting
- `GET /api/users/me` - Get current user profile
- `POST /api/subscriptions` - Manage subscriptions

### Authentication

All API requests require authentication via JWT token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://api.straytracker.app/api/animals
```

## 🐾 Animal Welfare Impact

Stray Tracker is more than just an app—it's a movement to improve animal welfare through community action:

- **📈 Track Impact**: Monitor collective community efforts
- **🏆 Success Stories**: Share and celebrate rescued animals
- **🤝 Partnerships**: Connect with local shelters and vets
- **📚 Education**: Learn about proper animal care
- **🌍 Global Reach**: Help animals worldwide through edge computing

## 📋 Roadmap

### Upcoming Features

- [ ] Mobile app for iOS and Android
- [ ] AI-powered animal identification
- [ ] Integration with animal shelters
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] AR features for enhanced tracking

### Recent Updates

- ✅ Progressive Web App capabilities
- ✅ Real-time notifications
- ✅ Collaborative naming system
- ✅ Advanced search and filtering
- ✅ Social media integration

## 📞 Support & Contact

### Get Help

- 📖 **Documentation**: Check our [technical docs](./docs/)
- 🐛 **Issues**: Report bugs on [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Discussions**: Join [GitHub Discussions](https://github.com/your-repo/discussions)
- 📧 **Email**: Contact us at support@straytracker.app

### Community

- 🐦 **Twitter**: Follow [@StrayTracker](https://twitter.com/straytracker)
- 📘 **Facebook**: Join our community group
- 🐾 **Instagram**: Share your success stories

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cloudflare** for providing excellent serverless infrastructure
- **TanStack** for the amazing suite of React tools
- **shadcn/ui** for beautiful, accessible components
- **Animal Welfare Organizations** for their guidance and expertise
- **Open Source Community** for making this possible

---

**Made with ❤️ for animals everywhere**

[⭐ Star this repo](https://github.com/your-repo/stray-tracker) | [🐛 Report Bug](https://github.com/your-repo/issues) | [💡 Request Feature](https://github.com/your-repo/issues)
