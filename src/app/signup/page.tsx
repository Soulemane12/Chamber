"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

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
    gender: "",
    race: "",
    education: "",
    profession: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatar(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting signup process...");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    console.log("Form data:", { ...form, password: "[REDACTED]" });

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${location.origin}/login`,
          data: {
            name: form.name,
            address: form.address,
            phone: form.phone,
            dob: form.dob,
            gender: form.gender,
            race: form.race,
            education: form.education,
            profession: form.profession,
          },
        },
      });

      console.log("Auth signup response:", { 
        user: signUpData?.user ? "User created" : "No user created", 
        session: signUpData?.session ? "Session created" : "No session created",
        error: signUpError ? signUpError.message : "No error" 
      });

      if (signUpError || !signUpData.user) {
        setError(signUpError?.message ?? "Signup failed");
        setLoading(false);
        return;
      }

      // If session is null, email confirmation is required
      if (!signUpData.session) {
        setConfirmSent(true);
        setLoading(false);
        return;
      }

      const userId = signUpData.user.id;
      console.log("User ID:", userId);
      let avatarUrl: string | null = null;

      if (avatar) {
        const fileExt = avatar.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("uploads").upload(filePath, avatar);
        if (!uploadError) {
          avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${filePath}`;
          console.log("Avatar uploaded:", avatarUrl);
        } else {
          console.error("Avatar upload error:", uploadError);
        }
      }

      if(documentFile) {
        const { error: docUploadError } = await supabase.storage.from("uploads").upload(`${userId}/documents/${documentFile.name}`, documentFile);
        if (docUploadError) {
          console.error("Document upload error:", docUploadError);
        } else {
          console.log("Document uploaded successfully");
        }
      }

      // Create profile record
      const profileData = {
        id: userId,
        name: form.name,
        // Remove email field since it doesn't exist in the profiles table
        // The email is already stored in the auth.users table
        address: form.address,
        phone: form.phone,
        dob: form.dob,
        avatar_url: avatarUrl,
        gender: form.gender,
        race: form.race,
        education: form.education,
        profession: form.profession,
      };
      
      console.log("Creating profile with data:", profileData);
      
      const { error: profileError } = await supabase.from("profiles").insert(profileData);
      
      if (profileError) {
        console.error("Error creating profile:", profileError);
        setError(`Error creating profile: ${profileError.message}`);
        setLoading(false);
        return;
      }
      
      console.log("Profile created successfully");
      router.push("/booking");
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      setError("An unexpected error occurred during signup");
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate first step
      if (!form.name || !form.email || !form.password || !form.confirmPassword) {
        setError("Please fill out all required fields");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  if (confirmSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl max-w-md text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm your email</h1>
          <p className="text-gray-700 dark:text-gray-300">We&apos;ve sent a confirmation link to <span className="font-medium">{form.email}</span>. Please check your inbox and click the link to activate your account.</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">After confirming, you can log in.</p>
          <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create your account</h1>
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6 animate-slide-in-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name *</label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                    placeholder="Your full name"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Password *</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Confirm Password *</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={form.confirmPassword} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-6 animate-slide-in-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Address *</label>
                  <input 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                    placeholder="Your full address"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone *</label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                    placeholder="Your phone number"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date of Birth *</label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={form.dob} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6 animate-slide-in-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Race/Ethnicity *</label>
                  <select
                    name="race"
                    value={form.race}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Education *</label>
                  <select
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Profession *</label>
                  <input
                    name="profession"
                    value={form.profession}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your profession or occupation"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Avatar (optional)</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                      {avatarPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange}
                        className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-blue-300" 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Document (optional)</label>
                  <input 
                    type="file" 
                    onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)} 
                    className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-blue-300" 
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Upload any supporting documents (ID, medical records, etc.)</p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Sign Up
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 