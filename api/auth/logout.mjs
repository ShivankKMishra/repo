// api/auth/logout.mjs
import express from 'express';
import cors from 'cors';
import { successResponse } from '../_utils.mjs';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/logout', (req, res) => {
  // JWT is stateless, so server doesn't need to do anything
  // Client will remove the token from local storage
  console.log("User logout - stateless with JWT");
  return successResponse(res, 200, { message: "Logged out successfully" });
});

export default app;