# Backend Setup (server)

This is the backend for the project, built with Node.js, Express, and MongoDB.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create a `.env` file in the `server` directory:**
   Example contents:

   ```env
   MONGO_URI=mongodb+srv://abdalrmanbadwy:Bgz4qiNKhZNMPPtt@cluster0.izjfuje.mongodb.net/AreebBadawyEvents?retryWrites=true&w=majority&appName=Cluster0
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=
   STRIPE_SECRET_KEY=
   NODEMAILER_EMAIL=
   NODEMAILER_PASSWORD=
   ```

3. **Start the backend server:**

```bash
npm start
```

The server will run on [http://localhost:3000](http://localhost:3000) by default.

## Project Structure

- `index.js`: Main entry point
- `routes/`: API route handlers
- `models/`: Mongoose models
- `config/`: Database configuration
- `middlewares/`: Custom middleware
- `helpers/`: Utility functions

## Troubleshooting

- Ensure MongoDB is running and the `MONGO_URI` in your `.env` file is correct.
- If you change the backend port, update the frontend proxy settings in `client/vite.config.ts`.

## Useful Commands

- **Install dependencies:** `npm install`
- **Start server with auto-reload:** `npm start` (uses `nodemon`)

---

For any issues, please contact me.
