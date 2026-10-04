import type { User } from "../models/User";
import { apiRequest } from "./apiRequest";

interface UserResponse {
    _embedded: {
        users: User[];
    };
}

export async function getUsers(): Promise<User[]> {
    const response = await apiRequest<UserResponse>("/user");
    return response._embedded.users;
}

// this class just example not truth
// POST
interface CreateUserRequest {
    username:string;
    password: string;
}

export async function createUser(data: CreateUserRequest) {
     return apiRequest<User>("/users", {
        method: "POST",
        body: JSON.stringify(data),
    });
}