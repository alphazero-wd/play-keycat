export interface Signup {
  username: string;
  email: string;
  password: string;
}

export interface Login extends Omit<Signup, "username"> {}
