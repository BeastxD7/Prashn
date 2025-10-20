import { Router } from "express";
import { createUser, deleteUserById, getAllUsers, getProfile, getUserById, loginUser, logoutUser, updateUserById } from "../controllers/user.controller";
import { cookieAuth } from "../middleware/user.middleware";

const UserRouter = Router();


UserRouter.post('/register', createUser);
UserRouter.post('/login', loginUser);
UserRouter.get('/', getAllUsers);
UserRouter.get('/me', cookieAuth, getProfile);
UserRouter.get('/:id', getUserById);
UserRouter.put('/:id', updateUserById);
UserRouter.delete('/:id', deleteUserById);
UserRouter.post('/logout', logoutUser);

export default UserRouter;