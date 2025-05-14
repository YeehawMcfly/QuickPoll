# QuickPoll – Real-Time Polling Application

QuickPoll is a full-stack web application that lets users create custom polls, vote in real time, and view live results. Built with a modern Vue 3 + TypeScript frontend and a secure Node.js/Express + MongoDB backend, QuickPoll supports real-time updates via Socket.IO, user authentication with JWTs, and comprehensive testing using Jest. The project is fully containerized with Docker and orchestrated with Docker Compose, with continuous integration and deployment set up via GitHub Actions.

## Technologies

**Frontend:**
- Vue 3, TypeScript, Vite
- Vue Router, Pinia
- Socket.IO Client
- CSS custom properties, modern responsive design

**Backend:**
- Node.js, Express
- MongoDB & Mongoose
- JWT-based authentication
- Socket.IO for real-time functionality

**Testing:**
- Jest (with ts-jest)
- Supertest for API endpoint testing

**DevOps & Deployment:**
- Docker & Docker Compose
- Nginx (for serving the client)
- GitHub Actions for CI/CD

## Features

- **Real-Time Polling:** Users can create polls and vote while instantly seeing live updates.
- **User Authentication:** Secure registration and login with JWTs, protecting sensitive endpoints.
- **Dynamic Poll Management:** Create, update, and delete polls along with voting and real-time results.
- **Responsive UI:** A modern, responsive frontend with smooth page transitions.
- **Testing:** Robust unit and integration tests ensure backend reliability.
- **Containerization & CI/CD:** Docker files for both client and server, with a GitHub Actions workflow that builds, tests, and pushes images to Docker Hub.

## Project Structure

```
QuickPoll/
├── .github/
│   └── workflows/
│       └── ci-cd.yml         # GitHub Actions CI/CD configuration
├── client/                   # Vue 3 + TypeScript frontend
│   ├── Dockerfile            # Multi-stage Dockerfile for client build & Nginx serve
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   ├── App.vue           # Main app layout with navigation, notifications, & footer
│   │   ├── main.ts           # Entry point for Vue
│   │   ├── router.ts         # Vue Router setup (SPA history mode)
│   │   ├── style.css         # Global styles and CSS variables
│   │   └── components/       # Reusable UI components (e.g. PollList, PollDetail, Login, Register, etc.)
│   └── ...
├── docker-compose.yml        # Orchestrates MongoDB, server, & client containers
├── server/                   # Node.js/Express backend
│   ├── Dockerfile            # Builds & runs the server app
│   ├── package.json
│   ├── tsconfig.json         # TypeScript compiler config for the server
│   └── src/
│       ├── index.ts          # Express app entry point and Socket.IO integration
│       ├── config/
│       │   └── db.ts         # MongoDB connection using Mongoose
│       ├── middleware/
│       │   └── auth.ts       # JWT authentication middleware
│       ├── models/
│       │   ├── pollModel.ts  # Mongoose schema for polls
│       │   └── userModel.ts  # Mongoose schema for users (with password hashing & compare method)
│       └── routes/
│           ├── authRoutes.ts # Routes for user registration/login
│           ├── pollRoutes.ts # Routes for creating, fetching, voting, and managing polls
│           └── __tests__/    # Jest tests for models and API endpoints
└── ...
```

## Setup & Usage

### Local Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/quickpoll.git
   cd quickpoll
   ```

2. **Server Setup:**
   - Navigate to the `server/` directory.
   - Install dependencies: `npm install`
   - Create a `.env` file (if needed) with variables such as `JWT_SECRET` and `MONGODB_URI`.
   - Start the server (in development mode): `npm run dev`

3. **Client Setup:**
   - Navigate to the `client/` directory.
   - Install dependencies: `npm install`
   - Start the development server: `npm run dev`
   - The client runs on [http://localhost:5173](http://localhost:5173)

### Running Tests

- From the `server/` directory, run:
  ```sh
  npm test
  ```
- This runs Jest tests (e.g., model tests in `server/src/models/__tests__/pollModel.test.ts` and route tests in `server/src/routes/__tests__/pollRoutes.test.ts`) and provides coverage reports with:
  ```sh
  npm run test:coverage
  ```

### Docker & Deployment

- **Build & Run Containers:**
  ```sh
  docker-compose up --build
  ```
  This command starts MongoDB, the server (on port 3000), and the client (on port 80).

- **CI/CD with GitHub Actions:**
  The GitHub Actions workflow in `.github/workflows/ci-cd.yml` runs tests, builds the client, and then uses Docker Buildx to build and push both server and client images to Docker Hub (ensure your secrets are set).

## Demo & Media Suggestions

- **Video:** Record a screen capture demonstrating:
  - The live creation of a poll and simultaneous voting in multiple browsers.
  - Navigation through authentication flows (login/register) and how real-time vote updates occur.
  - A terminal session showing `docker-compose up --build` and a GitHub Actions workflow run.
- **Screenshots:**
  - Before and after images of the authentication forms (centered input fields).
  - MongoDB Compass or a terminal screenshot of `db.polls.find()` showing stored poll documents.
  - API test results with Jest (a snippet of the coverage report).

## Future Improvements

- Enhance user analytics and poll result charts.
- Optimize performance for large-scale polling.
- Add social media sharing and notifications.
- Implement advanced security measures and refine error handling.

## License

This project is open-source and available under the MIT License.

---

Feel free to update any sections as your project evolves or new features are added.