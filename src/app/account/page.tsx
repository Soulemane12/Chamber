"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Head from "next/head";

interface Profile {
  id: string;
  name: string;      // Keep this for UI compatibility
  full_name?: string; // Add this for database compatibility
  // email is not stored in the profiles table
  address: string;
  phone: string;
  dob: string;
  avatar_url?: string | null;
  gender?: string;
  race?: string;
  education?: string;
  profession?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null); // Store the user object with defined type
  const [documents, setDocuments] = useState<{ name: string; url: string }[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile>({
    id: '',
    name: '',
    address: '',
    phone: '',
    dob: '',
    gender: '',
    race: '',
    education: '',
    profession: '',
    avatar_url: null
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Helper function to format demographic values for display
  const formatDemographic = (value: string): string => {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?redirect=/account");
        return;
      }

      setUser(user); // Store the user object

      // Fetch profile row
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData) {
        // create empty profile row
        await supabase.from("profiles").insert({ 
          id: user.id, 
          full_name: user.user_metadata.name ?? "",
          address: user.user_metadata.address ?? "", 
          phone: user.user_metadata.phone ?? "", 
          dob: user.user_metadata.dob ?? "",
          gender: user.user_metadata.gender ?? "",
          race: user.user_metadata.race ?? "",
          education: user.user_metadata.education ?? "",
          profession: user.user_metadata.profession ?? ""
        });
        setEditMode(false);
        setProfile({
          id: user.id,
          name: user.user_metadata.name ?? "",
          address: user.user_metadata.address ?? "",
          phone: user.user_metadata.phone ?? "",
          dob: user.user_metadata.dob ?? "",
          avatar_url: null,
          gender: user.user_metadata.gender ?? "",
          race: user.user_metadata.race ?? "",
          education: user.user_metadata.education ?? "",
          profession: user.user_metadata.profession ?? ""
        });
        setEditedProfile({
          id: user.id,
          name: user.user_metadata.name ?? "",
          address: user.user_metadata.address ?? "",
          phone: user.user_metadata.phone ?? "",
          dob: user.user_metadata.dob ?? "",
          avatar_url: null,
          gender: user.user_metadata.gender ?? "",
          race: user.user_metadata.race ?? "",
          education: user.user_metadata.education ?? "",
          profession: user.user_metadata.profession ?? ""
        });
      } else {
        setProfile({
          ...profileData as Profile,
          name: profileData.full_name || profileData.name || "", // Map full_name to name for UI
          // Add email from the user object since it's not in the profiles table
        });
        setEditedProfile({
          ...profileData as Profile,
          name: profileData.full_name || profileData.name || "", // Map full_name to name for UI
        });
      }

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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveChanges = async () => {
    if (!profile) return;
    
    // Reset states
    setSaveLoading(true);
    setMessage(null);
    
    try {
    const updates: Record<string, unknown> = {
        full_name: editedProfile.name,
        address: editedProfile.address,
        phone: editedProfile.phone,
        dob: editedProfile.dob,
        gender: editedProfile.gender,
        race: editedProfile.race,
        education: editedProfile.education,
        profession: editedProfile.profession,
    };

    // Avatar upload
    let avatar_url = profile.avatar_url;
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
      const path = `${profile.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage.from("uploads").upload(path, avatarFile, { upsert: true });
        if (upErr) {
          throw new Error(`Error uploading avatar: ${upErr.message}`);
        }
        avatar_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${path}`;
        updates["avatar_url"] = avatar_url;
      }

      // Update profile in database
      const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", profile.id);
      if (updateError) {
        throw new Error(`Error updating profile: ${updateError.message}`);
      }

      // Update local state with new profile data
      setProfile({
        ...profile,
        ...updates,
        name: editedProfile.name,
        avatar_url
      });
      
      setMessage({ text: "Profile updated successfully!", type: 'success' });
      setEditMode(false);
      setAvatarFile(null);
      
    } catch (error) {
      console.error('Error saving changes:', error);
      setMessage({ text: error instanceof Error ? error.message : 'An unknown error occurred', type: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const cancelEdit = () => {
    if (!profile) return;
    setEditedProfile({
      ...profile
    });
    setAvatarFile(null);
    setEditMode(false);
    setMessage(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 flex flex-col items-center">
      <Head>
        <title>WellNex02 - My Account</title>
      </Head>
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Account Settings</h1>
          <div className="w-14"></div> {/* Spacer for centering the title */}
        </div>
        
        {/* Success and Error Messages */}
        {message && (
          <div className={`mb-6 p-4 ${message.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-300'} rounded`}>
            <div className="flex">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* VIEW OR EDIT MODE */}
        {editMode ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                {profile?.avatar_url && !avatarFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="Avatar" className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/30" />
                ) : avatarFile ? (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={URL.createObjectURL(avatarFile)} 
                      alt="New avatar preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} 
                  className="hidden" 
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click the camera icon to change your profile picture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                <input 
                  name="name" 
                  value={editedProfile.name} 
                  onChange={handleEditChange} 
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                <input 
                  name="email" 
                  value={user?.email || ""} 
                  disabled
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300" 
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed directly</p>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                <input 
                  name="phone" 
                  value={editedProfile.phone} 
                  onChange={handleEditChange} 
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Address</label>
                <input 
                  name="address" 
                  value={editedProfile.address} 
                  onChange={handleEditChange} 
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={editedProfile.dob} 
                  onChange={handleEditChange} 
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-6 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Demographic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Gender</label>
                  <select 
                    name="gender" 
                    value={editedProfile.gender} 
                    onChange={handleEditChange} 
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Race/Ethnicity</label>
                  <select 
                    name="race" 
                    value={editedProfile.race} 
                    onChange={handleEditChange} 
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select race/ethnicity</option>
                    <option value="asian">Asian</option>
                    <option value="black">Black or African American</option>
                    <option value="hispanic">Hispanic or Latino</option>
                    <option value="native_american">Native American or Alaska Native</option>
                    <option value="pacific_islander">Native Hawaiian or Pacific Islander</option>
                    <option value="white">White</option>
                    <option value="multiracial">Multiracial</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Education</label>
                  <select 
                    name="education" 
                    value={editedProfile.education} 
                    onChange={handleEditChange} 
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select education level</option>
                    <option value="high_school">High School or GED</option>
                    <option value="some_college">Some College</option>
                    <option value="associates">Associate&apos;s Degree</option>
                    <option value="bachelors">Bachelor&apos;s Degree</option>
                    <option value="masters">Master&apos;s Degree</option>
                    <option value="doctorate">Doctorate</option>
                    <option value="professional">Professional Degree</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Profession</label>
                  <input 
                    name="profession" 
                    value={editedProfile.profession} 
                    onChange={handleEditChange} 
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-6 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Documents</h2>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Upload new document</label>
                <div className="flex items-center">
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {avatarFile ? avatarFile.name : "Choose file"}
                    </span>
                    <input type="file" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} className="hidden" />
                  </label>
                </div>
                {documents.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current documents:</h3>
                    <ul className="space-y-2">
                      {documents.map((doc) => (
                        <li key={doc.name} className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            {doc.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelEdit} 
                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveChanges} 
                disabled={saveLoading}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saveLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex flex-col items-center">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="Avatar" className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/30" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex-1 w-full">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-gray-900 dark:text-white">{profile?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white">{user?.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white">{profile?.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-gray-900 dark:text-white">{profile?.address || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                      <p className="text-gray-900 dark:text-white">{profile?.dob || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Demographic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                  <p className="text-gray-900 dark:text-white">{profile?.gender ? formatDemographic(profile.gender) : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Race/Ethnicity</p>
                  <p className="text-gray-900 dark:text-white">{profile?.race ? formatDemographic(profile.race) : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Education</p>
                  <p className="text-gray-900 dark:text-white">{profile?.education ? formatDemographic(profile.education) : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profession</p>
                  <p className="text-gray-900 dark:text-white">{profile?.profession || "-"}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h2>
              {documents.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No documents uploaded.</p>
              ) : (
                <ul className="space-y-3">
                  {documents.map((doc) => (
                    <li key={doc.name} className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                      </div>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="ml-4 flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button 
                onClick={() => setEditMode(true)} 
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
              
              <button 
                onClick={handleLogout} 
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 