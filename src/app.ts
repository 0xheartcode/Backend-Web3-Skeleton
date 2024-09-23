import express from 'express';
import routes from './routes';
import { checkRequiredEnvVariables, initializeDatabase } from './dbcode/dbSetup';

// Check required environment variables
checkRequiredEnvVariables();

// Initialize database connection
await initializeDatabase();

const app = express();
const PORT = 8080;

// Middleware
// used to receive JSON input. POST, PUT, PATCH
app.use(express.json()); // for parsing application/json
// enable this if you want to receive FORMS
// app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Apply routes
app.use('/', routes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next(err);  // Pass the error to Express's default error handler
});



// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('Basic Operations:');
  console.log('  - GET /basic/getPing: Basic ping (unrestricted)');
  console.log('  - GET /basic/getSafePing: Authenticated ping');
  console.log('  - POST /basic/setBearerToken: Set new bearer token');
  console.log('  - GET /basic/getCurrentToken: Get current bearer token');
  console.log('  - POST /basic/changeBearerToken: Change bearer token');
});
// Examples should be on Postman

server.on('error', (e: NodeJS.ErrnoException) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try the following:`);
    console.error(`1. Stop any other servers running on port ${PORT}`);
    console.error(`2. Choose a different port by setting the PORT environment variable`);
    console.error(`3. Wait a few seconds and try again (the port might be in a cleanup state)`);
  } else {
    console.error('An unexpected error occurred:', e.message);
  }
  process.exit(1);
});
