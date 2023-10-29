import { Signup } from "../signup";

export interface Login extends Omit<Signup, "username"> {}
