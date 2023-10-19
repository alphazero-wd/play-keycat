import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/features/ui";
import { ReactNode } from "react";

interface AuthWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const AuthWrapper = ({
  title,
  subtitle,
  children,
}: AuthWrapperProps) => {
  return (
    <div className="container max-w-xl">
      <Card className="max-w-[600px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
};
