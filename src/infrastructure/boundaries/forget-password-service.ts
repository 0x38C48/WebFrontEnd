import { SendCodeRequest, ResetPasswordRequest } from "../models/forget-password";

/**
 * 忘记密码服务接口
 */
export interface IForgetPasswordService {
    
    /**
     * 重置密码
     * @param request 重置密码请求
     */
    resetPassword(request: ResetPasswordRequest): Promise<void>;

}