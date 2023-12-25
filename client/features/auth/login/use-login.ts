"use client";

import { useAlert } from "@/features/ui/alert";
import { timeout } from "@/features/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { login } from "./login-api";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Email is invalid" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const useLogin = () => {
  const setAlert = useAlert.use.setAlert();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    await timeout(1000);
    try {
      const { data: user } = await login(values);
      setAlert("success", `Welcome back, ${user.username}!`);
      form.reset();
      router.refresh();
      router.replace("/");
    } catch (error: any) {
      let message = "";
      switch (error.response.status) {
        case 400:
          message = "Wrong email or password provided";
          break;
        case 500:
          message = "Something went wrong :(";
          break;
        default:
          message = "";
          break;
      }
      setAlert("error", message);
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
