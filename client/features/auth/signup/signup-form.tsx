"use client";

import { Button } from "@/features/ui/button";
import { Form, FormField, FormItem } from "@/features/ui/form";
import { Loader } from "@/features/ui/loader";
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
                  <>
                    Your username is public to other players.
                    <br />
                    Between 1-30 characters long
                    <br />
                    Contain only letters, numbers and underscores (_).
                  </>
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
                  <>
                    At least 6 characters
                    <br />
                    At least 1 lower letter and 1 uppercase letter
                    <br />
                    At least 1 number
                    <br />
                    At least 1 special character
                  </>
                }
              />
            </FormItem>
          )}
        />

        <Button disabled={loading} type="submit">
          {loading ? (
            <>
              <Loader />
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
