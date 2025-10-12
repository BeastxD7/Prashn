import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";


export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form); // 🔗 Replace with your API call
  };

  return (
    <AuthCard title="Create your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label>First Name</Label>
            <Input name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
          <div className="flex-1">
            <Label>Last Name</Label>
            <Input name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <Label>Username</Label>
          <Input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <Button type="submit" className="w-full mt-2">
          Register
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="underline hover:text-primary">Login</a>
        </p>
      </form>
    </AuthCard>
  );
}
