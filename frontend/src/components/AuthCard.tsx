import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";



interface AuthCardProps {
  title: string;
  children: ReactNode;
}

export const AuthCard = ({ title, children }: AuthCardProps) => (
  <div className="h-full flex items-center justify-center bg-background text-foreground px-4 transition-colors">
    <Card className="w-full max-w-md shadow-lg border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-semibold tracking-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </div>
);
