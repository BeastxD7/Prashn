import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form); // 🔗 Replace with your login API call
  };

  return (
    <AuthCard title="Welcome back">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Username</Label>
          <Input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <Button type="submit" className="w-full mt-2">
          Login
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Don’t have an account?{" "}
          <a href="/register" className="underline hover:text-primary">Sign up</a>
        </p>
      </form>
    </AuthCard>
  );
}
