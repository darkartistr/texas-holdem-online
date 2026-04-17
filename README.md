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

## Ledger pagination behavior (mock mode)

- The `GET /api/v1/ledger` endpoint uses cursor-based pagination with `cursor` and `limit`.
- Ordering is `created DESC`, and `nextCursor` is the last `id` from the current page.
- Guarantee: each response is internally consistent for the filtered snapshot computed during that request.
- Limitation with concurrent mock-data changes: across multiple requests, entries can shift between pages (possible duplicates or skips) because the in-memory dataset may change between calls.
- Client behavior: filter changes reset `cursor` to avoid mixing pages from different query states.