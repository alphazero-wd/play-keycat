"use client";

import { Button, Form, FormField, FormItem } from "@/features/ui";
import { useLogin } from "./use-login";
import { InputGroup } from "../shared";
import { Loader2 } from "lucide-react";

export const LoginForm = () => {
  const { form, loading, onSubmit } = useLogin();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <InputGroup
                label="Email"
                inputProps={{
                  ...field,
                  placeholder: "user@example.com",
                  type: "email",
                }}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <InputGroup
                label="Password"
                inputProps={{
                  ...field,
                  placeholder: "••••••",
                  type: "password",
                }}
              />
            </FormItem>
          )}
        />

        <Button disabled={loading} type="submit">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log in"}
        </Button>
      </form>
    </Form>
  );
};
