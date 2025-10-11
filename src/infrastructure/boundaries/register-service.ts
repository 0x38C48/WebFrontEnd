import {RegisterRequest} from "~/infrastructure/models/register";
export interface IRegisterResponse {
    code: number;
    msg: string;
    register(registerRequest: RegisterRequest): Promise<any>;
}