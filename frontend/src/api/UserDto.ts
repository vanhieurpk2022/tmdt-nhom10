

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    // user?: User;
}

export type RegisterRequest = RegisterResponse;

export interface RegisterResponse{
    fullname:string;
    email:string;
    phone:string;
    password:string;
    verifyPassword:string;
}

