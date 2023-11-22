"use client";

import { Button } from "@/features/ui/button";
import { Form, FormField, FormItem } from "@/features/ui/form";
import { Loader } from "@/features/ui/loader";
import { InputGroup } from "../shared";
import { useLogin } from "./use-login";

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
          {loading ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </Form>
  );
};
