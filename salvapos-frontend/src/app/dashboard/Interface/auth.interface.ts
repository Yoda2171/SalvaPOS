export interface Login {
  email: string;
  password: string;
}

export interface Register {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
}

export interface ResetPassword {
  resetToken: string;
  password: string;
}

export interface RequestResetPassword {
  email: string;
}
