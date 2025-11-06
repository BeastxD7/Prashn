import { Router } from "express";
import { changePassword, createUser, deleteUserById, forgotPassword, getAllUsers, getProfile, getUserById, getUserCredits, loginUser, logoutUser, resetPassword, updateUserById, refreshAccessToken } from "../controllers/user.controller";
import { cookieAuth } from "../middleware/user.middleware";
import { authRateLimiter, passwordResetRateLimiter } from "../middleware/rateLimit";

const UserRouter = Router();


UserRouter.post('/register', createUser);
UserRouter.post('/login', authRateLimiter, loginUser);
UserRouter.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
UserRouter.post('/reset-password', passwordResetRateLimiter, resetPassword);
UserRouter.get('/', getAllUsers);
UserRouter.get('/me', cookieAuth, getProfile);
UserRouter.get('/credits', cookieAuth, getUserCredits);
UserRouter.get('/:id', getUserById);
UserRouter.put('/:id', updateUserById);
UserRouter.delete('/:id', deleteUserById);
UserRouter.post('/logout', logoutUser);
UserRouter.post('/refresh', refreshAccessToken);
UserRouter.post('/change-password', cookieAuth, changePassword);

export default UserRouter;