"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface Profile {
  id: string;
  name: string;
  email?: string;
  address: string;
  phone: string;
  dob: string;
  avatar_url?: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch profile row
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData as Profile);

      // List documents
      const { data: fileList } = await supabase.storage
        .from("uploads")
        .list(`${user.id}/documents`, { limit: 100, offset: 0 });

      if (fileList) {
        const docs = fileList.map((file) => ({
          name: file.name,
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${user.id}/documents/${file.name}`,
        }));
        setDocuments(docs);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!profile) return <div className="p-4">No profile data found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex flex-col items-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Account Settings</h1>
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="Avatar" className="w-32 h-32 rounded-full object-cover mb-4 sm:mb-0" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 sm:mb-0">
              <span className="text-gray-500">No Avatar</span>
            </div>
          )}
          <div className="flex-1 space-y-2 w-full">
            <p><span className="font-semibold">Name:</span> {profile.name}</p>
            <p><span className="font-semibold">Email:</span> {profile.email ?? "-"}</p>
            <p><span className="font-semibold">Address:</span> {profile.address}</p>
            <p><span className="font-semibold">Phone:</span> {profile.phone}</p>
            <p><span className="font-semibold">Date of Birth:</span> {profile.dob}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No documents uploaded.</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {documents.map((doc) => (
              <li key={doc.name}>
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {doc.name}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex justify-end">
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
} 