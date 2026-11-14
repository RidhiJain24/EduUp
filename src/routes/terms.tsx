import { createFileRoute } from "@tanstack/react-router";
import { FileText, UserCheck, AlertTriangle, Video, HelpCircle, ShieldAlert } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CONTACT_EMAIL } from "@/lib/config";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — EduUp" },
      {
        name: "description",
        content:
          "Read the Terms of Use for EduUp, an AI-assisted computer science learning platform built by students.",
      },
      { property: "og:title", content: "Terms of Use — EduUp" },
      {
        property: "og:description",
        content:
          "Read the Terms of Use for EduUp, an AI-assisted computer science learning platform built by students.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Use"
      badge="User Agreement"
      lastUpdated="November 14, 2026"
      description="Please read these Terms of Use before using EduUp. By creating an account or accessing the platform, you agree to these clear, student-friendly terms."
    >
      {/* 1. Introduction & Acceptance */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-primary" /> 1. Acceptance of Terms
        </h2>
        <p className="text-muted-foreground">
          Welcome to EduUp! EduUp is an educational software project built by computer science students to help peers learn programming, review coursework, and practice technical problem-solving with AI-assisted coaching.
        </p>
        <p className="text-muted-foreground">
          By signing up, logging in, or navigating EduUp, you agree to be bound by these Terms of Use. If you do not agree, you must discontinue using the platform.
        </p>
      </section>

      {/* 2. User Accounts & Security */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <UserCheck className="h-5 w-5 text-accent" /> 2. Account Registration & Responsibilities
        </h2>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside">
          <li><strong>Accurate Details:</strong> You agree to provide a valid email address and genuine name when registering.</li>
          <li><strong>Credential Confidentiality:</strong> You are solely responsible for maintaining the confidentiality of your login credentials and for all learning activity conducted under your account.</li>
          <li><strong>One Person, One Account:</strong> Accounts are intended for individual learners and may not be transferred or shared.</li>
        </ul>
      </section>

      {/* 3. Acceptable Use */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-primary" /> 3. Acceptable Use Policy
        </h2>
        <p className="text-muted-foreground">
          EduUp is an educational study tool designed for constructive learning. You agree NOT to:
        </p>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2 text-xs sm:text-sm text-muted-foreground">
          <p>• Attempt to probe, exploit, or bypass authentication, security safeguards, or backend rate limits.</p>
          <p>• Submit malicious scripts, automated spam, exploits, or harmful payloads via code submission inputs.</p>
          <p>• Reverse-engineer, scrape at scale, or place unreasonable strain on EduUp infrastructure or API endpoints.</p>
          <p>• Use EduUp for commercial resale, unauthorized tutoring business operations, or automated cheating services.</p>
        </div>
      </section>

      {/* 4. AI Feedback Disclaimer */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> 4. AI Feedback Disclaimer: Not a Substitute for Teachers
        </h2>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-6 space-y-3">
          <h3 className="font-semibold text-foreground text-base">Important Notice on Automated AI Grading:</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            EduUp utilizes automated generative AI models (including Google Gemini) to analyze submitted code, provide feedback suggestions, and generate answer explanations. While our prompts strive for accuracy, <strong>AI-generated feedback may occasionally be incomplete, inaccurate, or produce false positives/negatives ("hallucinations")</strong>.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            EduUp feedback is an automated supplemental study aid. It is <strong>NOT a replacement for human professors, instructors, university teaching assistants, accredited curriculum, or official academic examinations</strong>. Always cross-reference critical course requirements with your school's textbooks and faculty instructions.
          </p>
        </div>
      </section>

      {/* 5. Third-Party Content & YouTube Videos */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Video className="h-5 w-5 text-accent" /> 5. Third-Party Content & Educational Videos
        </h2>
        <p className="text-muted-foreground">
          EduUp curates and references educational video playlists available publicly on YouTube. 
        </p>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2 text-xs sm:text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Intellectual Property Rights:</strong> All videos, audio tracks, and instructional recordings linked or embedded inside EduUp belong strictly and completely to their original creators, educators, and YouTube channel copyright owners.
          </p>
          <p>
            EduUp merely indexes, structures, and links to public content via official YouTube APIs and embeds. EduUp does not host, upload, or claim any copyright ownership over third-party video lectures.
          </p>
        </div>
      </section>

      {/* 6. No Warranty & Service Continuity */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <HelpCircle className="h-5 w-5 text-primary" /> 6. "As Is" Warranty & Platform Changes
        </h2>
        <p className="text-muted-foreground">
          EduUp is provided on an <strong>"AS IS" and "AS AVAILABLE" basis</strong> without warranty of any kind, whether express, implied, or statutory.
        </p>
        <p className="text-muted-foreground">
          Because EduUp is an evolving student-built project, features, question pools, badges, streak metrics, and server availability may be updated, altered, temporarily suspended, or retired at any time without liability or advance notice.
        </p>
      </section>

      {/* 7. Contact */}
      <section className="space-y-3">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          7. Questions Regarding These Terms
        </h2>
        <p className="text-muted-foreground">
          If you have questions about these Terms of Use, suggestions for improvement, or academic integrity inquiries, please reach out directly to us at:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary underline">
            {CONTACT_EMAIL}
          </a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
