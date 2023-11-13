"use client";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/ui/form";
import { Input } from "@/features/ui/input";
import { ReactNode } from "react";

interface InputGroupProps {
  label: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  desc?: ReactNode;
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
