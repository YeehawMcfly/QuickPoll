# QuickPoll – Real-Time Polling Application

QuickPoll is a full-stack web application that lets users create custom polls, vote in real time, and view live results. Built with a modern Vue 3 + TypeScript frontend and a secure Node.js/Express + MongoDB backend, QuickPoll supports real-time updates via Socket.IO, user authentication with JWTs, and comprehensive testing using Jest.

**🚀 Live Demo:** [https://yeehawmcfly.github.io/QuickPoll/](https://yeehawmcfly.github.io/QuickPoll/)

## Architecture & Deployment

QuickPoll uses a modern cloud-native architecture with automated CI/CD:

### Production Infrastructure
- **Frontend:** Deployed on **GitHub Pages** with automatic builds via GitHub Actions
- **Backend API:** Hosted on **Render** with auto-deploy from the main branch
- **Database:** **MongoDB Atlas** cloud database with connection pooling
- **Real-time:** Socket.IO connections for live poll updates across all clients

### Deployment Pipeline
1. **Code Push** → GitHub repository triggers automated workflows
2. **Frontend Build** → GitHub Actions compiles Vue 3 app and deploys to GitHub Pages
3. **Backend Deploy** → Render automatically builds and deploys the Express API
4. **Database** → MongoDB Atlas handles data persistence with automatic backups

### Environment Configuration
- **Frontend:** Builds with production API endpoints pointing to Render backend
- **Backend:** Configured with environment variables for MongoDB connection, JWT secrets, and CORS policies
- **CORS Setup:** Properly configured to allow GitHub Pages → Render API communication

## Technologies

**Frontend:**
- Vue 3, TypeScript, Vite
- Vue Router for SPA routing (with GitHub Pages compatibility)
- Socket.IO Client for real-time updates
- CSS custom properties, modern responsive design

**Backend:**
- Node.js, Express
- MongoDB Atlas & Mongoose ODM
- JWT-based authentication with bcrypt password hashing
- Socket.IO for real-time functionality

**Testing:**
- Jest (with ts-jest) for unit and integration tests
- Supertest for API endpoint testing
- Comprehensive test coverage for auth, voting, and race conditions

**DevOps & Deployment:**
- GitHub Actions for automated CI/CD
- Docker & Docker Compose for local development
- Render for backend hosting
- GitHub Pages for frontend hosting

## Features

- **Real-Time Polling:** Users can create polls and vote while instantly seeing live updates across all connected devices
- **User Authentication:** Secure registration and login with JWTs, protecting poll creation and management endpoints
- **Concurrent Voting:** Robust handling of race conditions when multiple users vote simultaneously
- **Dynamic Poll Management:** Create, update, activate/deactivate, and delete polls with real-time synchronization
- **Vote Tracking:** Prevents duplicate voting with both client-side and server-side validation
- **Responsive UI:** Modern, responsive design with smooth animations and transitions
- **Testing:** Comprehensive Jest and Supertest suites covering authentication, voting logic, and API endpoints
- **Production Ready:** Full CI/CD pipeline with automated testing, building, and deployment

## Project Structure

```
QuickPoll/
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml    # GitHub Pages deployment for Vue frontend
│       └── test-backend.yml       # Automated testing for Express backend
├── client/                        # Vue 3 + TypeScript frontend
│   ├── 404.html                   # SPA routing support for GitHub Pages
│   ├── Dockerfile                 # Multi-stage build for production
│   ├── index.html                 # SPA entry point with GitHub Pages routing
│   ├── package.json
│   ├── vite.config.ts             # Vite config with GitHub Pages base path
│   └── src/
│       ├── App.vue                # Main layout with navigation and real-time notifications
│       ├── main.ts                # Vue app initialization with router
│       ├── router.ts              # Vue Router with SPA history mode
│       ├── style.css              # Global design system and CSS variables
│       ├── store/
│       │   └── auth.ts            # Custom composable for authentication and vote tracking
│       └── components/            # Vue components
│           ├── PollList.vue       # Homepage with search and real-time updates
│           ├── PollDetail.vue     # Voting interface with live results
│           ├── CreatePoll.vue     # Poll creation form
│           ├── Dashboard.vue      # User's polls management
│           ├── Login.vue          # Authentication form
│           └── Register.vue       # User registration
├── docker-compose.yml             # Local development orchestration
└── server/                        # Node.js/Express backend
    ├── Dockerfile                 # Production container build
    ├── jest.config.js             # Jest testing configuration
    ├── package.json
    ├── render.yaml                # Render deployment configuration
    ├── tsconfig.json              # TypeScript compiler config
    └── src/
        ├── index.ts               # Express app with Socket.IO and CORS setup
        ├── config/
        │   └── db.ts              # MongoDB Atlas connection with Mongoose
        ├── middleware/
        │   └── auth.ts            # JWT authentication middleware
        ├── models/
        │   ├── pollModel.ts       # Poll schema with vote tracking and validation
        │   ├── userModel.ts       # User schema with bcrypt password hashing
        │   └── __tests__/         # Model unit tests
        └── routes/
            ├── authRoutes.ts      # Registration and login endpoints
            ├── pollRoutes.ts      # CRUD operations and voting with Socket.IO
            └── __tests__/         # API integration tests with Supertest
```

## Setup & Usage

### Live Application
Visit the live application at: **[https://yeehawmcfly.github.io/QuickPoll/](https://yeehawmcfly.github.io/QuickPoll/)**

- Create an account or log in
- Browse existing polls or create your own
- Vote and watch results update in real-time
- Manage your polls from the dashboard

### Local Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yeehawmcfly/QuickPoll.git
   cd QuickPoll
   ```

2. **Server Setup:**
   ```sh
   cd server
   npm install
   # Create .env file with:
   # MONGODB_URI=mongodb://127.0.0.1:27017/quickpoll
   # JWT_SECRET=your-secret-key
   # PORT=3000
   npm run dev
   ```

3. **Client Setup:**
   ```sh
   cd client
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

4. **Docker Development:**
   ```sh
   docker-compose up --build
   # Runs complete stack with MongoDB
   ```

### Running Tests

**Backend Testing:**
```sh
cd server
npm test                    # Run all Jest tests
npm run test:coverage      # Generate coverage report
```

Tests cover:
- Authentication flows and JWT validation
- Poll CRUD operations and ownership verification
- Voting logic and duplicate vote prevention
- Race condition handling for concurrent votes
- Socket.IO real-time event emission

### Production Deployment

**Automatic Deployment:**
- **Frontend:** Push to `main` branch → GitHub Actions builds and deploys to GitHub Pages
- **Backend:** Push to `main` branch → Render automatically builds and deploys API

**Manual Deployment:**
```sh
# Frontend to GitHub Pages
cd client
npm run build
# Artifacts automatically deployed via GitHub Actions

# Backend to Render
# Render watches the repository and auto-deploys on push
```

## Demo & Media Suggestions

- **Live Demo:** Open [the application](https://yeehawmcfly.github.io/QuickPoll/) in multiple browser tabs to see real-time voting
- **Video Demo:** Record creating a poll and watching votes update simultaneously across different devices
- **Technical Demo:** Show the GitHub Actions workflow running and Render deployment logs
- **Database:** MongoDB Atlas dashboard showing poll documents and vote counts

## Architecture Highlights

**Real-Time Synchronization:**
- Socket.IO maintains persistent connections between clients and server
- Vote updates broadcast instantly to all connected users
- Poll creation/deletion events synchronized across sessions

**Security & Authentication:**
- JWT tokens for stateless authentication
- Password hashing with bcrypt
- Protected routes for poll management
- CORS configured for cross-origin requests

**Scalability:**
- MongoDB Atlas handles database scaling automatically
- Render provides container orchestration and auto-scaling
- GitHub Pages CDN ensures fast global content delivery
- Stateless backend design supports horizontal scaling

## Future Improvements

- **Enhanced Analytics:** Detailed voting statistics and poll performance metrics
- **Advanced Visualizations:** Charts and graphs for poll results
- **Social Features:** Poll sharing, comments, and social media integration
- **Mobile App:** React Native or Flutter mobile application
- **Enterprise Features:** Team polls, organization management, and advanced permissions
- **Performance:** Caching layer with Redis for high-traffic scenarios

## License

This project is open-source and available under the MIT License.

---

**Built with ❤️ for real-time collaboration**