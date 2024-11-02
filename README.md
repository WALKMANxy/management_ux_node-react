<div align="center">

# NEXT_M Management Software

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/yourusername/next-m/issues)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A cutting-edge management software solution built for modern businesses, featuring real-time communication, advanced analytics, and comprehensive business tools.

[Demo](https://rcsnext.com) • [Report Bug](https://github.com/yourusername/next-m/issues) • [Request Feature](https://github.com/yourusername/next-m/issues)

[test.jpg](https://postimg.cc/Js30Wc3S)
</div>

## 🌟 Features

<details>
<summary>Click to expand feature list</summary>

### 🔐 User Management
- **Admin Controls**
  - Full CRUD operations for entities (clients, admins, agents, employees)
  - User deletion capabilities
  - Entity assignment system

- **Authentication**
  - Secure login & registration
  - Password reset functionality
  - Session persistence
  - Auto-renewal system

### 📊 Analytics & Dashboards
- **Role-Specific Dashboards**
  - Custom views per user type
  - Real-time data updates
  
- **Advanced Analytics**
  - Revenue tracking (net/gross)
  - Client analytics
  - Sales distribution
  - Trend analysis

### 💬 Real-time Communication
- **Modern Chat System**
  - One-to-one & group chats
  - Broadcast messaging
  - AWS S3 file sharing
  - Message search
  - Last seen indicators
  
- **Performance Features**
  - Web Worker optimization
  - AES256 encrypted caching
  - Attachment preview system

### 🗓️ Business Tools
- **Visit Management**
  - Scheduling system
  - Privacy controls
  
- **Promotion System**
  - Custom promotion creation
  - Client targeting
  
- **Calendar Integration**
  - Absence tracking
  - Event management
  - National holiday support

### 💻 Technical Excellence
- **Responsive Design**
  - Mobile-first approach
  - Custom component library (95%)
  - Touch-optimized interfaces

- **State Management**
  - Redux Toolkit integration
  - RTK Query optimization
  - Real-time sync

</details>

## 🌐 Localization

| Language | Status |
|----------|---------|
| 🇬🇧 English | Complete |
| 🇮🇹 Italian | Complete |
| 🇫🇷 French | ~70% |
| 🇩🇪 German | ~70% |
| 🇪🇸 Spanish | ~70% |
| 🇷🇺 Russian | ~70% |

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 14.0.0
- npm ≥ 6.0.0
- MongoDB Atlas account
- AWS S3 account

### Installation

1. **Clone the repository**
```
git clone https://github.com/yourusername/next-m.git
cd next-m
```

2. **Set up environment variables**

Create `.env` files in both server and client directories using the provided templates below.

<details>
<summary>Server Environment Variables</summary>

Required variables for server setup:
- `NODE_ENV`
- `PORT`
- `BASE_URL`
- `MONGO_URI`
- [View full list](#server-environment-variables)
</details>

<details>
<summary>Client Environment Variables</summary>

Required variables for client setup:
- `VITE_APP_NAME`
- `VITE_API_BASE_URL`
- `VITE_APP_URL`
- [View full list](#client-environment-variables)
</details>

3. **Install dependencies and start development servers**

```bash
# Backend setup
cd server
npm install
npm run dev

# Frontend setup
cd ../client
npm install
npm run dev
```

## 🏗️ Architecture

### Frontend
- React + Vite
- TypeScript
- Redux Toolkit + RTK Query
- Material-UI
- Custom Components
- Web Workers
- dexie.js

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Socket.IO
- AWS S3
- Winston Logger

## 🔒 Security Measures

- Helmet integration
- Content Security Policy
- Rate limiting
- AES256 encryption
- IP logging
- Location tracking
- Token-based auth
- No cookies policy

## 🤝 Contributing

We love your input! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

### Development Process

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Lead - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/next-m](https://github.com/yourusername/next-m)

---

<div align="center">

Made with ❤️ by [Your Name](https://github.com/yourusername)

⭐️ Star us on GitHub — it helps!

</div>
