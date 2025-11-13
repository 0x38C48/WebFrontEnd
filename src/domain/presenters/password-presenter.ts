import { PasswordData } from "~/domain/models/info";
import { ID_INFO_SERVICE, ID_MESSAGE_SERVICE } from "~/types";
import { IMessageService } from "~/infrastructure/boundaries/message-service";
import { IInfoService } from "~/domain/boundaries/info-service";
import { inject, injectable } from "inversify";

interface PasswordValidationResult {
    isValid: boolean;
    message: string;
}

@injectable()
export class PasswordPresenter {
    constructor(
        @inject(ID_MESSAGE_SERVICE) private readonly messageService: IMessageService,
        @inject(ID_INFO_SERVICE) private readonly service: IInfoService
    ) { }

    public async submit(data: PasswordData): Promise<void> {
        const validation = this.validatePasswordData(data);
        
        if (!validation.isValid) {
            this.messageService.warning(validation.message);
            return;
        }

        try {
            const response = await this.service.updatePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
            
            if (response.code === 0) {
                this.messageService.success("密码修改成功！");
            } else {
                this.messageService.error(response.msg || "密码修改失败，请重试");
            }
        } catch (error) {
            console.error("Password update error:", error);
            this.messageService.error("网络错误，请检查网络连接");
        }
    }

    public async reset(data: PasswordData): Promise<void> {
        data.oldPassword = "";
        data.newPassword = "";
        data.checkPassword = "";
    }

    private validatePasswordData(data: PasswordData): PasswordValidationResult {
        if (!data.oldPassword?.trim()) {
            return { isValid: false, message: "请输入旧密码" };
        }

        if (!data.newPassword?.trim()) {
            return { isValid: false, message: "请输入新密码" };
        }

        if (data.oldPassword === data.newPassword) {
            return { isValid: false, message: "新密码不能与旧密码相同" };
        }

        if (data.newPassword !== data.checkPassword) {
            return { isValid: false, message: "两次输入的新密码不一致" };
        }

        const passwordValidation = this.validatePasswordStrength(data.newPassword);
        if (!passwordValidation.isValid) {
            return passwordValidation;
        }

        return { isValid: true, message: "" };
    }

    private validatePasswordStrength(password: string): PasswordValidationResult {
        if (password.length < 8) {
            return { isValid: false, message: "密码长度必须至少为8位字符" };
        }

        if (password.length > 20) {
            return { isValid: false, message: "密码长度不能超过20位字符" };
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const characterTypes = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

        if (characterTypes < 3) {
            return { 
                isValid: false, 
                message: "密码必须包含至少3种字符类型（大写字母、小写字母、数字、特殊字符）" 
            };
        }

        return { isValid: true, message: "" };
    }

    public checkPasswordStrength(password: string): { score: number; text: string; class: string } {
        if (!password) {
            return { score: 0, text: "", class: "" };
        }

        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        score = Math.min(score, 4);

        const strengthMap = {
            1: { text: "弱", class: "weak" },
            2: { text: "一般", class: "fair" },
            3: { text: "良好", class: "good" },
            4: { text: "强", class: "strong" }
        };

        return {
            score,
            ...strengthMap[score as keyof typeof strengthMap]
        };
    }
}