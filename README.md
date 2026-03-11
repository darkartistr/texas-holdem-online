# Texas Hold'em Online

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd texas-holdem-online
   ```

2. **Install server dependencies**
   ```bash
   npm install --force
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install --force
   cd ..
   ```

4. **Start the development servers**
   ```bash
   npm start
   ```
   
   This will start both the backend server (port 7777) and the React development server (port 3000) concurrently.

   Or run them separately:
   ```bash
   # Terminal 1: Backend server
   npm run dev:server
   
   # Terminal 2: Frontend client
   npm run start:client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:7777