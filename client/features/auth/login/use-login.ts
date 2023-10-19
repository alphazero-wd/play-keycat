"use client";

import * as z from "zod";
import * as authApi from "@/features/auth/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAlert } from "@/features/layout/alert";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Please provide a valid email" }),
  password: z.string({ required_error: "Password is required" }),
});

export const useLogin = () => {
  const { setAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const { data: user } = await authApi.login(values);
      setAlert("success", `Welcome back, ${user.username}!`);
      form.reset();
      router.push("/");
      router.refresh();
    } catch (error: any) {
      const message: string = error.response.data.message;
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
