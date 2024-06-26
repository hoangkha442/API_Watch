export class ResetPasswordDto {
    email: string;
  }
  
  export class NewPasswordDto {
    token: string;
    newPassword: string;
  }