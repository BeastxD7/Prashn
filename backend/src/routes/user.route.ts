import { Router } from "express";
import { createUser, deleteUserById, getAllUsers, getUserById, updateUserById } from "../controllers/user.controller";

const UserRouter = Router();


UserRouter.post('/', createUser);
UserRouter.get('/', getAllUsers);
UserRouter.get('/:id', getUserById);
UserRouter.put('/:id', updateUserById);
UserRouter.delete('/:id', deleteUserById);

export default UserRouter;