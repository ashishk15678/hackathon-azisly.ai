"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {
  Cancel01Icon,
  Edit01Icon,
  FloppyDiskIcon,
  Image01Icon,
  PlusSignIcon,
} from "hugeicons-react";
import { Alert, Avatar, Button, Card, Field, Input } from "@/components/ui";
import { cn } from "@/lib/cn";

type College = { id: string; name: string };
type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  college: College | null;
};

const AVATAR_PRESETS = [
  // Dicebear-style public avatar URLs (no auth needed, deterministic)
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Priya",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Arjun",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Sneha",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Rohan",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Zara",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Dev",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Ananya",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Karan",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Meera",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Vikram",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Deepa",
];

export function ProfileForm({ user, colleges }: { user: User; colleges: College[] }) {
  const router = useRouter();
  const trpc   = useTRPC();

  const [name,         setName]         = useState(user.name);
  const [avatarUrl,    setAvatarUrl]     = useState(user.image ?? "");
  const [customUrl,    setCustomUrl]     = useState("");
  const [showCustom,   setShowCustom]    = useState(false);
  const [collegeId,    setCollegeId]     = useState(user.college?.id ?? "");
  const [newCollege,   setNewCollege]    = useState("");
  const [showNewColl,  setShowNewColl]   = useState(false);
  const [success,      setSuccess]       = useState(false);
  const [errors,       setErrors]        = useState<Record<string, string>>({});

  const update = useMutation(
    trpc.profile.update.mutationOptions({
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh(); // re-fetch nav session so name/avatar update everywhere
      },
    }),
  );

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (showCustom && customUrl && !isValidUrl(customUrl)) errs.avatar = "Enter a valid image URL";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const finalAvatar = showCustom && customUrl ? customUrl : (avatarUrl || null);
    update.mutate({
      name: name.trim(),
      image: finalAvatar,
      ...(showNewColl && newCollege
        ? { newCollege: newCollege.trim() }
        : collegeId
          ? { collegeId }
          : {}),
    });
  }

  const displayAvatar = showCustom && customUrl ? customUrl : avatarUrl;

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Image01Icon size={16} className="text-indigo-500" />
          Avatar
        </h2>

        {/* Current avatar preview */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200"
              />
            ) : (
              <Avatar name={name} size="lg" className="rounded-2xl" />
            )}
            {displayAvatar && (
              <button
                onClick={() => { setAvatarUrl(""); setCustomUrl(""); setShowCustom(false); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Remove avatar"
              >
                <Cancel01Icon size={10} />
              </button>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{name || "Your name"}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {displayAvatar ? "Custom avatar set" : "Using initials avatar"}
            </p>
          </div>
        </div>

        {/* Preset grid */}
        <p className="text-xs font-medium text-gray-500 mb-2">Choose a preset</p>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {AVATAR_PRESETS.map((url) => (
            <button
              key={url}
              onClick={() => { setAvatarUrl(url); setShowCustom(false); setCustomUrl(""); }}
              className={cn(
                "w-10 h-10 rounded-xl overflow-hidden border-2 transition-all hover:scale-110",
                avatarUrl === url && !showCustom
                  ? "border-indigo-500 ring-2 ring-indigo-300"
                  : "border-transparent hover:border-indigo-300",
              )}
              aria-label="Select avatar"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Custom URL toggle */}
        <div className="border-t border-gray-100 pt-3">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              <PlusSignIcon size={12} />
              Use a custom image URL
            </button>
          ) : (
            <div className="space-y-2">
              <Field label="Custom avatar URL" id="custom-avatar" error={errors.avatar}>
                <Input
                  id="custom-avatar"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  error={!!errors.avatar}
                />
              </Field>
              <button
                onClick={() => { setShowCustom(false); setCustomUrl(""); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Name & college */}
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Edit01Icon size={16} className="text-indigo-500" />
          Account details
        </h2>

        <Field label="Display name" id="name" required error={errors.name}>
          <Input
            id="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors({}); }}
            placeholder="Your name"
            error={!!errors.name}
          />
        </Field>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            College
            <span className="ml-2 text-xs font-normal text-gray-400">optional</span>
          </label>

          {!showNewColl ? (
            <div className="flex gap-2">
              <select
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                <option value="">— Select college —</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={() => { setShowNewColl(true); setCollegeId(""); }}
                className="text-xs text-indigo-600 hover:underline whitespace-nowrap flex items-center gap-1"
              >
                <PlusSignIcon size={12} />
                Add new
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={newCollege}
                onChange={(e) => setNewCollege(e.target.value)}
                placeholder="College name…"
                className="flex-1"
              />
              <button
                onClick={() => { setShowNewColl(false); setNewCollege(""); }}
                className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      {success && <Alert variant="success">Profile updated!</Alert>}
      {update.error && <Alert variant="error">{update.error.message}</Alert>}

      <div className="flex gap-3">
        <Button onClick={() => router.push("/dashboard")} variant="ghost">
          ← Dashboard
        </Button>
        <Button loading={update.isPending} onClick={handleSave}>
          <FloppyDiskIcon size={15} />
          Save changes
        </Button>
      </div>
    </div>
  );
}

function isValidUrl(s: string) {
  try { new URL(s); return true; } catch { return false; }
}
