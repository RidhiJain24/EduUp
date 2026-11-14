import { createFileRoute } from "@tanstack/react-router";
import { Cookie, Key, Trash2, Video, CheckCircle2, Sliders } from "lucide-react";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CONTACT_EMAIL } from "@/lib/config";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies & Local Storage Policy — EduUp" },
      {
        name: "description",
        content:
          "Transparency on cookies and browser storage at EduUp. Zero advertising or tracking cookies; full breakdown of our client localStorage keys.",
      },
      { property: "og:title", content: "Cookies & Local Storage Policy — EduUp" },
      {
        property: "og:description",
        content:
          "Transparency on cookies and browser storage at EduUp. Zero advertising or tracking cookies; full breakdown of our client localStorage keys.",
      },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const storageKeys = [
    {
      key: "token",
      type: "String (JWT)",
      purpose: "Authentication",
      description:
        "Stores your JSON Web Token (JWT) after a successful login or sign-up. Your browser sends this token in the Authorization header to authenticate requests with the EduUp backend API. It is cleared automatically whenever you click 'Log out'.",
    },
    {
      key: "eduup_study_timer",
      type: "JSON Object",
      purpose: "Study Timer Preferences",
      description:
        "Preserves the state of your dashboard focus timer (selected mode: Focus 25m, Short Break 5m, Long Break 15m; remaining seconds; start timestamp; running state) so your study session is not lost if you refresh or switch tabs.",
    },
    {
      key: "eduup_game_scramble_best",
      type: "Number",
      purpose: "Mini-Game High Score",
      description:
        "Saves your personal all-time best score in the 'Word Scramble' CS terminology brain-break game on your dashboard.",
    },
    {
      key: "eduup_game_quiz_best",
      type: "Number",
      purpose: "Mini-Game High Score",
      description:
        "Saves your personal highest score in the 'Quick Quiz' 60-second CS trivia break challenge.",
    },
    {
      key: "eduup_game_memory_best",
      type: "Number",
      purpose: "Mini-Game High Score",
      description:
        "Saves your personal best score (lowest number of moves to complete 8 CS card pairs) in the 'Memory Match' game.",
    },
  ];

  return (
    <LegalPageLayout
      title="Cookies & Local Storage"
      badge="Storage Transparency"
      lastUpdated="November 14, 2026"
      description="EduUp takes a radically transparent approach to client-side data. We do not use advertising cookies, marketing trackers, or third-party web analytics. Here is the exact list of browser storage keys we use and why."
    >
      {/* 1. Cookie-Free Philosophy */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" /> 1. No Advertising, Tracking, or Analytics Cookies
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 leading-relaxed text-muted-foreground text-sm sm:text-base">
          <p>
            Unlike many commercial websites, <strong className="text-foreground">EduUp sets zero cookies for advertising, social tracking, or third-party analytics</strong>. We do not load Google Analytics, Meta Pixel, Hotjar, or advertising attribution scripts.
          </p>
          <p>
            We believe an educational platform for students should be clean, fast, and completely free from digital surveillance.
          </p>
        </div>
      </section>

      {/* 2. Complete Local Storage Key Registry */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Key className="h-5 w-5 text-primary" /> 2. Complete List of Local Storage Keys Used
        </h2>
        <p className="text-muted-foreground">
          Instead of storing data on opaque tracking servers, EduUp stores a few functional items directly inside your browser's private <code>localStorage</code> sandbox:
        </p>

        <div className="space-y-3">
          {storageKeys.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 transition-colors hover:border-primary/40 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <code className="rounded-lg bg-muted px-2.5 py-1 font-mono text-xs sm:text-sm font-bold text-primary">
                    {item.key}
                  </code>
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                    {item.purpose}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                  {item.type}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Session Storage */}
      <section className="space-y-3">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Sliders className="h-5 w-5 text-accent" /> 3. Session Storage
        </h2>
        <p className="text-muted-foreground">
          EduUp currently stores <strong>zero items in sessionStorage</strong>. All volatile user interactions (such as current question navigation and in-progress form inputs) are held only in React memory during active rendering.
        </p>
      </section>

      {/* 4. Third-Party Embedded Video Cookies */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Video className="h-5 w-5 text-primary" /> 4. Third-Party Cookies (YouTube Player Embeds)
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            When you watch video playlists curated from YouTube or play the optional demo video inside our demo modal, content is served directly from YouTube’s servers (using privacy-enhanced <code>youtube-nocookie.com</code> mode where configured).
          </p>
          <p>
            Google/YouTube may set their own functional cookies or store local preferences (such as playback quality and volume) in accordance with <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Google’s Privacy Policy</a> once you initiate video playback. EduUp does not receive or inspect those third-party cookies.
          </p>
        </div>
      </section>

      {/* 5. How to Clear Stored Data */}
      <section className="space-y-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Trash2 className="h-5 w-5 text-rose-500" /> 5. How to Clear Your Local Storage
        </h2>
        <p className="text-muted-foreground">
          You are always in full control of your local browser data. To completely delete all stored keys:
        </p>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-xs sm:text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Method 1 (Within EduUp):</strong> Clicking <strong>Log out</strong> in the dashboard dropdown menu automatically purges your authentication <code>token</code>.
          </div>
          <div>
            <strong className="text-foreground">Method 2 (Browser Settings):</strong>
            <ul className="mt-1 list-disc list-inside space-y-1 pl-2">
              <li><strong>Chrome / Edge:</strong> Go to Settings → Privacy and security → Cookies and site data → search for <em>EduUp</em> or <em>localhost</em> → click <em>Clear data</em>.</li>
              <li><strong>Firefox:</strong> Go to Settings → Privacy & Security → Cookies and Site Data → <em>Clear Data</em>.</li>
              <li><strong>Safari:</strong> Go to Preferences → Privacy → <em>Manage Website Data</em>.</li>
            </ul>
          </div>
          <div>
            <strong className="text-foreground">Method 3 (Developer Tools):</strong> Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground border border-border">F12</kbd>, open the <strong>Application</strong> (or <strong>Storage</strong>) tab, select <strong>Local Storage</strong>, right-click, and choose <strong>Clear</strong>.
          </div>
        </div>
      </section>

      {/* 6. Contact */}
      <section className="space-y-3">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          6. Need Help or Have Questions?
        </h2>
        <p className="text-muted-foreground">
          If you have questions regarding our localStorage usage or privacy practices, feel free to contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary underline">
            {CONTACT_EMAIL}
          </a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
