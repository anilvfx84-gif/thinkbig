import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCallerProfile, useSaveProfile } from "@/hooks/useProfile";
import type { AccountRole } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Check, Compass, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";

const ROLE_OPTIONS: {
  value: AccountRole;
  label: string;
  blurb: string;
  icon: typeof Lightbulb;
}[] = [
  {
    value: "seller" as AccountRole,
    label: "Idea Seller",
    blurb: "Publish ideas and meet buyers.",
    icon: Lightbulb,
  },
  {
    value: "buyer" as AccountRole,
    label: "Idea Buyer",
    blurb: "Discover ideas and express interest.",
    icon: Compass,
  },
];

export function ProfilePage() {
  const { isAuthenticated, login } = useInternetIdentity();
  const { data: profile, isLoading, isFetched } = useCallerProfile();
  const saveProfile = useSaveProfile();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [roles, setRoles] = useState<AccountRole[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isFetched || initialized) return;
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setContactEmail(profile.contactEmail);
      setRoles(profile.roles);
    }
    setInitialized(true);
  }, [isFetched, profile, initialized]);

  const toggleRole = (role: AccountRole) => {
    setSaved(false);
    setRoles((current) =>
      current.includes(role)
        ? current.filter((value) => value !== role)
        : [...current, role],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    saveProfile.mutate(
      {
        displayName: displayName.trim(),
        bio: bio.trim(),
        contactEmail: contactEmail.trim(),
        roles,
      },
      { onSuccess: () => setSaved(true) },
    );
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div
          className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6"
          data-ocid="profile.auth_gate"
        >
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Your profile
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign in to set your display name, bio, and contact email.
          </p>
          <Button
            type="button"
            className="mt-6 rounded-full"
            onClick={() => login()}
            data-ocid="profile.signin_button"
          >
            Sign in
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Account
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Your profile
          </h1>
          <div className="mt-5 h-px w-32 origin-left animate-rule-grow bg-accent" />
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            This is what the other side of the table sees when you publish or
            express interest.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
        {isLoading ? (
          <p className="text-muted-foreground">Loading your profile…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Display name</Label>
              <Input
                id="profile-name"
                value={displayName}
                onChange={(event) => {
                  setSaved(false);
                  setDisplayName(event.target.value);
                }}
                placeholder="Ada Okonkwo"
                data-ocid="profile.name_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-bio">Short bio</Label>
              <Textarea
                id="profile-bio"
                value={bio}
                onChange={(event) => {
                  setSaved(false);
                  setBio(event.target.value);
                }}
                placeholder="Investor focused on climate and health ventures across Africa."
                rows={4}
                data-ocid="profile.bio_textarea"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Contact email</Label>
              <Input
                id="profile-email"
                type="email"
                value={contactEmail}
                onChange={(event) => {
                  setSaved(false);
                  setContactEmail(event.target.value);
                }}
                placeholder="you@example.com"
                data-ocid="profile.email_input"
              />
              <p className="text-xs text-muted-foreground">
                Shown to the other side so they can reach you directly.
              </p>
            </div>

            <fieldset>
              <legend className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Roles
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {ROLE_OPTIONS.map((option) => {
                  const active = roles.includes(option.value);
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleRole(option.value)}
                      aria-pressed={active}
                      data-ocid={`profile.role_toggle.${option.value}`}
                      className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-smooth ${
                        active
                          ? "border-accent bg-accent/10"
                          : "border-border bg-card hover:border-accent/50"
                      }`}
                    >
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                          active
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          {option.label}
                          {active ? (
                            <Check
                              className="size-3.5 text-accent"
                              aria-hidden="true"
                            />
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {option.blurb}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {saveProfile.isError ? (
              <p
                className="text-sm text-destructive"
                data-ocid="profile.error_state"
              >
                Could not save your profile. Please try again.
              </p>
            ) : null}
            {saved ? (
              <p
                className="text-sm text-success"
                data-ocid="profile.success_state"
              >
                Profile saved.
              </p>
            ) : null}

            <div className="border-t border-border pt-6">
              <Button
                type="submit"
                size="lg"
                className="rounded-full"
                disabled={saveProfile.isPending || roles.length === 0}
                data-ocid="profile.save_button"
              >
                {saveProfile.isPending ? "Saving…" : "Save profile"}
              </Button>
              {roles.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Choose at least one role to continue.
                </p>
              ) : null}
            </div>
          </form>
        )}
      </section>
    </Layout>
  );
}
