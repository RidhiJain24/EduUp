import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Database, Cpu, Lock, UserCheck, AlertCircle } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CONTACT_EMAIL } from "@/lib/config";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — EduUp" },
      {
        name: "description",
        content:
          "Learn how EduUp collects, uses, and safeguards your student data. Student-built, transparent, zero ads, and no selling of data.",
      },
      { property: "og:title", content: "Privacy Policy — EduUp" },
      {
        property: "og:description",
        content:
          "Learn how EduUp collects, uses, and safeguards your student data. Student-built, transparent, zero ads, and no selling of data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      badge="Student Data Protection"
      lastUpdated="November 14, 2026"
      description="At EduUp, we treat your learning data with utmost respect. Here is an honest, straightforward explanation of what information we collect, how it powers your learning experience, and how we protect it."
    >
      {/* Student Project Notice */}
      <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong className="text-foreground font-semibold">Student-Built & Student-First:</strong>{" "}
            EduUp is an independent, non-commercial learning platform built by computer science students for fellow learners. We do not monetize personal data, show advertisements, or track you across the web.
          </div>
        </div>
      </section>

      {/* 1. Data We Collect */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Database className="h-5 w-5 text-primary" /> 1. Data We Collect
        </h2>
        <p className="text-muted-foreground">
          We collect only the minimum information required to operate the learning platform, calculate progress, and provide automated grading:
        </p>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Account Credentials</h3>
            <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-muted-foreground list-disc list-inside">
              <li><strong className="text-foreground">Full Name:</strong> Used to personalize your dashboard and greetings.</li>
              <li><strong className="text-foreground">Email Address:</strong> Used for account login and notifications.</li>
              <li><strong className="text-foreground">Password:</strong> Stored <em>strictly as a salted bcrypt hash</em>. We never store, log, or have access to your plain-text password.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Learning Activity & Submissions</h3>
            <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-muted-foreground list-disc list-inside">
              <li><strong className="text-foreground">Submitted Answers & Code:</strong> Your multiple-choice choices and programming solutions.</li>
              <li><strong className="text-foreground">AI Scores & Feedback:</strong> Numerical scores (0–100) and generated feedback strings.</li>
              <li><strong className="text-foreground">Streaks & Badges:</strong> Consecutive active study days and unlocked achievement milestone keys.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. How Your Data Is Used */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Cpu className="h-5 w-5 text-accent" /> 2. How Your Data Is Used
        </h2>
        <p className="text-muted-foreground">
          Everything we collect serves direct functional purposes inside EduUp:
        </p>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside">
          <li><strong className="text-foreground">Assignment Grading & Review:</strong> Evaluating multiple-choice correctness and requesting automated AI code feedback.</li>
          <li><strong className="text-foreground">Progress & Streak Tracking:</strong> Calculating consecutive daily study streaks, average scores, and accuracy percentages.</li>
          <li><strong className="text-foreground">Achievement Unlocks:</strong> Awarding student badges (such as First Steps, Streak Starter, Week Warrior, and Perfectionist).</li>
          <li><strong className="text-foreground">Personalized Dashboard:</strong> Displaying your recent feedback, weekly activity graphs, and subject mastery.</li>
        </ul>
      </section>

      {/* 3. Third-Party Services */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-primary" /> 3. Third-Party Service Providers
        </h2>
        <p className="text-muted-foreground">
          To provide modern AI and content capabilities, EduUp interacts with select third-party services:
        </p>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h4 className="font-semibold text-foreground text-sm">Google Gemini API</h4>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              When you submit coding assignments or request explanations for incorrect MCQ answers, the question text, options, and your submitted answer/code are transmitted to Google's Gemini API via a secure backend proxy. This enables instant code evaluation, automated score calculation, and plain-text answer explanations.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h4 className="font-semibold text-foreground text-sm">YouTube Data API & Embedded Players</h4>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              EduUp uses YouTube's official public API to search and organize curated computer science video playlists. Videos are played through YouTube's embedded player (using privacy-enhanced <code>youtube-nocookie.com</code> mode where supported).
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h4 className="font-semibold text-foreground text-sm">Public Tech News RSS & Hacker News API</h4>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              The live tech news feed on the dashboard and <code>/news</code> page fetches public RSS feeds (TechCrunch, The Verge, Ars Technica, freeCodeCamp, Dev.to) and the official Hacker News Firebase API on the server. No user data is ever transmitted to these news providers.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h4 className="font-semibold text-foreground text-sm">Cloud Infrastructure & Database Hosting</h4>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              EduUp servers and databases run on secure cloud infrastructure providers with network-level encryption, firewalls, and automated backups.
            </p>
          </div>
        </div>
      </section>

      {/* 4. No Selling of Data & No Ads */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <UserCheck className="h-5 w-5 text-accent" /> 4. No Selling of Data and Zero Ads
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <p className="text-muted-foreground">
            <strong className="text-foreground">We never sell, rent, license, or trade your personal data.</strong> Your submissions and profile information will never be shared with advertisers, data brokers, or marketing networks.
          </p>
          <p className="text-muted-foreground">
            EduUp is free of commercial banners, tracking pixels, and behavioral retargeting.
          </p>
        </div>
      </section>

      {/* 5. Security Note */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Lock className="h-5 w-5 text-primary" /> 5. Security Architecture
        </h2>
        <p className="text-muted-foreground">
          We implement industry standard defensive practices to protect your data:
        </p>
        <ul className="space-y-1.5 text-muted-foreground list-disc list-inside text-xs sm:text-sm">
          <li><strong>Transport Security:</strong> All client-to-server traffic is forced over HTTPS using modern TLS encryption.</li>
          <li><strong>Cryptographic Password Hashing:</strong> Passwords are processed using <code>bcrypt</code> with 10 salt rounds before storage in the database.</li>
          <li><strong>Token Authentication:</strong> Authenticated requests require short-lived, signed JSON Web Tokens (JWT) verified on every private endpoint.</li>
        </ul>
      </section>

      {/* 6. Account Deletion & Data Rights */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-accent" /> 6. Data Rights & Account Deletion
        </h2>
        <p className="text-muted-foreground">
          You have full control over your learning history. If you wish to delete your account or request an export of your data:
        </p>
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 sm:p-5">
          <p className="text-sm text-foreground">
            Send an email to <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary underline">{CONTACT_EMAIL}</a> with the subject line <em>"Account Deletion Request"</em> from your registered EduUp email address.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Upon verification, your account record, all question submissions, AI scores, study streaks, and earned badges will be permanently erased from our database within 5 business days.
          </p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
