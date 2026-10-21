import type { User } from "../models/User";

interface UserResponse {
    _embedded: {
        users: User[];
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    // user?: User;
}

export interface RegisterRequest{

}

export interface RegisterResponse{
    fullname:string;
    email:string;
    phone:string;
    password:string;
    verifyPassword:string;
}

