import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
      <SignIn afterSignInUrl="/dashboard" />
    </div>
  );
}
