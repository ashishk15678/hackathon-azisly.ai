import { createCaller } from "@/trpc/server";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profile — AptiQuiz" };

export default async function ProfilePage() {
  const caller   = await createCaller();
  const [me, colleges] = await Promise.all([
    caller.profile.me(),
    caller.profile.colleges(),
  ]);

  return (
    <div className="max-w-5xl mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Your profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your name, avatar, and college. Only your name is shown to other players.
        </p>
      </div>
      <ProfileForm user={me} colleges={colleges} />
    </div>
  );
}
