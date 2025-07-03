"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError || !signUpData.user) {
      setError(signUpError?.message ?? "Signup failed");
      setLoading(false);
      return;
    }

    const userId = signUpData.user.id;
    let avatarUrl: string | null = null;

    if (avatar) {
      const fileExt = avatar.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("uploads").upload(filePath, avatar);
      if (!uploadError) {
        avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${filePath}`;
      }
    }

    if (documentFile) {
      await supabase.storage.from("uploads").upload(`${userId}/documents/${documentFile.name}`, documentFile);
    }

    await supabase.from("profiles").insert({
      id: userId,
      name: form.name,
      address: form.address,
      phone: form.phone,
      dob: form.dob,
      avatar_url: avatarUrl,
    });

    router.push("/booking");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Sign Up</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none" />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none" />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none" />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Confirm Password</label>
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none" />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Address</label>
          <input name="address" value={form.address} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none" />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none" />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Date of Birth</label>
          <input type="date" name="dob" value={form.dob} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none" />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Avatar (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] ?? null)} className="w-full" />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Document (optional)</label>
          <input type="file" onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)} className="w-full" />
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account? <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
} 