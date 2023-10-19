"use client";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/features/ui";
import { ReactNode } from "react";

interface InputGroupProps {
  label: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  desc?: string;
}

export const InputGroup = ({ label, inputProps, desc }: InputGroupProps) => {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input {...inputProps} />
      </FormControl>
      {desc && <FormDescription>{desc}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
};
