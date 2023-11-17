"use client";

import {
  STRONG_PASSWORD_REGEX,
  VALID_USERNAME_REGEX,
} from "@/features/constants";
import { useAlert } from "@/features/ui/alert";
import { timeout } from "@/features/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { login } from "../login";
import { signup } from "./signup-api";

const formSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .max(30, { message: "Username can only be 30 characters long" })
    .regex(VALID_USERNAME_REGEX, {
      message: "Username can only contain letters, numbers and underscores (_)",
    }),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Please provide a valid email" }),
  password: z
    .string({ required_error: "Password is required" })
    .regex(STRONG_PASSWORD_REGEX, { message: "Password is not strong enough" }),
});

export const useSignup = () => {
  const setAlert = useAlert.use.setAlert();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "", password: "" },
  });
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    await timeout(2000);
    try {
      await signup(values);
      await login({
        email: values.email,
        password: values.password,
      });
      setAlert("success", "Account created successfully 🎉");
      form.reset();
      router.refresh();
      router.replace("/");
    } catch (error: any) {
      const message: string = error.response.data.message;
      // error about username/email duplication
      if (message.includes("username"))
        form.setError("username", { message }, { shouldFocus: true });
      if (message.includes("email"))
        form.setError("email", { message }, { shouldFocus: true });
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    onSubmit,
    loading,
  };
};
