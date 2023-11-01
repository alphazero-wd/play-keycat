"use client";

import { Button } from "@/features/ui/button";
import { Form, FormField, FormItem } from "@/features/ui/form";
import { Loader2 } from "lucide-react";
import { InputGroup } from "../shared";
import { useSignup } from "./use-signup";

export const SignupForm = () => {
  const { form, loading, onSubmit } = useSignup();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <InputGroup
                label="Username"
                inputProps={{ ...field, placeholder: "sample_username" }}
                desc={
                  "Your username is public to other players.\nBetween 1-30 characters long\nContain only letters, numbers and underscores (_)."
                }
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <InputGroup
                label="Email"
                inputProps={{
                  ...field,
                  type: "email",
                  placeholder: "user@example.com",
                }}
                desc="Your email is kept private"
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
                  type: "password",
                  placeholder: "••••••",
                }}
                desc={
                  "At least 6 characters\nAt least 1 lower letter and 1 uppercase letter\nAt least 1 number\nAt least 1 special character"
                }
              />
            </FormItem>
          )}
        />

        <Button disabled={loading} type="submit">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </Form>
  );
};
