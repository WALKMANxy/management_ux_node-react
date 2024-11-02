<div align="center">

# NEXT_M Management Software

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/WALKMANxy/management_ux_node-react/issues)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

A cutting-edge management software solution built for modern businesses, featuring real-time communication, advanced analytics, and comprehensive business tools.

[Demo](https://rcsnext.com) • [Report Bug](https://github.com/WALKMANxy/management_ux_node-react/issues) • [Request Feature](https://github.com/WALKMANxy/management_ux_node-react/issues)

[![test.jpg](https://i.postimg.cc/3xVvmtkr/test.jpg)](https://postimg.cc/Js30Wc3S)
</div>


## 🌟 Features

<details>
<summary>Click to expand feature list</summary>

### 🔐 User Management
- **Admin Controls**
  - Full CRUD operations for entities (clients, admins, agents, employees)
  - User deletion capabilities
  - Entity assignment system, only registered and verified users that have been assigned an entity by an admin can enter the app

- **Authentication**
  - Secure login & registration
  - Account verification via email after registration
  - Password reset functionality
  - Session persistence
  - Auto-renewal system

### 📊 Analytics & Dashboards
- **Role-Specific Dashboards**
  - Custom views per user type
  - Possibility of real-time data updates upon necessity and data source
  
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
  - Server reception and "seen" status indicators
  - Supports automated messages via NEXT_ Bot (Scheduled visits, events, reminders)
  
- **Performance Features**
  - Web Worker optimization
  - AES256 encrypted caching

### 🗓️ Business Tools
- **Visit Management**
  - Scheduling system
  - Private and public notes inside the visits, the former only visible to the agent linked to the visit, and the admins.
  
- **Promotion System**
  - Custom promotion creation
  - Client targeting
  
- **Calendar Integration**
  - Absence tracking
  - Event management
  - Supports locale's Nation Holiday via nager.date

### 💻 Technical Excellence
- **Responsive Design**
  - Full support for mobile, tablets and desktops
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

- Node.js ≥ 22.0.0
- npm ≥ 6.0.0
- MongoDB Cluster 
- AWS S3 account (for file sharing support)
- Postmark API key (for automated email system)
- LocationIQ API Key (for reverse geocoding)

### Installation

1. **Clone the repository**
```
git clone https://github.com/WALKMANxy/management_ux_node-react.git
cd management_ux_node-react
```

2. **Set up environment variables**

Create `.env` files in both server and client directories using the provided templates below as a start.

<details>
<summary>Server Environment Variables</summary>

```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
APP_URL=http://localhost:3000
REFRESH_TOKEN_DURATION=30d
SESSION_DURATION=30d
IPINFO_TOKEN=your_ipinfo_token
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BOT_TOKEN=your_bot_token
REDIRECT_URI=http://localhost:3000/oauth2callback
SSL_KEY_PATH=path_to_ssl_key
SSL_CERT_PATH=path_to_ssl_cert
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REVERSE_GEO_TOKEN=your_reverse_geo_token
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=30d
SESSION_DURATION=30d
POSTMARK_API_TOKEN=your_postmark_api_token
JWT_EXPIRES_IN=15m
PASSWORD_RESET_EXPIRES_IN=1h
MONGO_URI=your_mongodb_connection_string
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
```
</details>

<details>
<summary>Client Environment Variables</summary>

```env
VITE_APP_NAME=NEXT_M
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_URL=http://localhost:3000
VITE_DEV_CRT=path_to_dev_cert
VITE_DEV_KEY=path_to_dev_key
VITE_UPDATE_TIME_MS=60000
```
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
- @fortawesome
- ag-grid-react
- apexcharts
- i18next
- react-hook-form
- List virtualization
- Sonner

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Socket.IO
- AWS S3
- Winston Logger
- OAuth 2
- Postmark

## 🔒 Security Measures

- Helmet integration
- Content Security Policy
- Rate limiting
- AES256 encryption
- IP logging
- Location tracking
- Token-based auth
- No cookies policy (future proofing for possible Android / iOS companion app.)

## 🤝 Contributing

This is a pet project, and we welcome any contributions! Feel free to open any issues or pull requests if you'd like to help improve the project, or find any glaring issues (which you very well might!).

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Lead - [@WALKMANxy](https://github.com/WALKMANxy)

Project Link: [https://github.com/WALKMANxy/management_ux_node-react](https://github.com/WALKMANxy/management_ux_node-react)

---

<div align="center">

Made with ❤️, sweat and tears by WALKMAN


</div>
