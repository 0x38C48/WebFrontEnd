export interface ForgetPasswordRequest {
  username: string;
  email: string;
  emailCode: string; // 邮箱验证码
  imageCode: string; // 图片验证码
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  username: string;
  newPassword: string;
}