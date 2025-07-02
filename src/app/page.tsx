
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

const useCases = [
  {
    title: "Reels & Shorts",
    desc: "Perfect for social creators looking to boost engagement with AI-generated short videos."
  },
  {
    title: "Marketing Videos",
    desc: "Promote your product or service using automated video workflows and voiceovers."
  },
  {
    title: "Educational Content",
    desc: "Create quick explainer videos with subtitles, captions, and visuals in just minutes."
  },
  {
    title: "Product Demos",
    desc: "Turn text instructions into demo walkthroughs instantly."
  },
  {
    title: "Real Estate Showcases",
    desc: "Generate beautiful walkthroughs from photos or property scripts."
  },
  {
    title: "Client Proposals",
    desc: "Send video-based pitches that convert better than PDFs or decks."
  }
];

const integrations = [
  "YouTube", "Instagram", "TikTok", "Firebase", "Razorpay", 
  "Remotion", "AssemblyAI", "ElevenLabs", "Gemini AI"
];

const faqs = [
  {
    q: "Is Videomatics AI free to use?",
    a: "Yes! You can create and preview videos for free. Rendering/download credits may apply."
  },
  {
    q: "Do I need video editing skills?",
    a: "No. Our AI handles everything from voiceovers to visuals. You just give the idea."
  },
  {
    q: "Can I download videos?",
    a: "Yes, rendered videos can be downloaded or shared directly."
  }
];

const footerLinks = {
  Product: ["AI Video Generator", "Templates", "Pricing"],
  Company: ["About", "Blog", "Contact"],
  Support: ["Help Center", "FAQs", "Discord"],
  Legal: ["Privacy Policy", "Terms", "Refunds"],
};

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        } transition-all duration-1000`}
      >
        <div className="space-y-20">
          <section className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Create Stunning Videos with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                AI Magic
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your ideas into professional videos in minutes using cutting-edge AI technology.
              <br /> <br />
              Your Own Video Generator AI
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" className="hover:scale-105 transition-transform duration-200 text-lg px-8 py-4">
                <Link href="/dashboard">Start Creating Now</Link>
              </Button>
            </div>
          </section>

          <section className="bg-card/50 rounded-xl p-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Popular Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {useCases.map((item, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-md transition-all hover:shadow-xl hover:scale-105">
                  <h3 className="text-xl font-semibold text-primary mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="text-center space-y-10">
            <h2 className="text-3xl md:text-4xl font-bold">Seamless Integrations</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Videomatics AI works great with your favorite platforms.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {integrations.map((item) => (
                 <span key={item} className="px-6 py-2 border border-border rounded-full bg-card/80">{item}</span>
              ))}
            </div>
          </section>

          <section className="bg-muted/30 p-10 rounded-xl space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h4 className="font-semibold text-primary mb-1">Q: {item.q}</h4>
                  <p className="text-muted-foreground">A: {item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-muted/50 py-12 mt-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-muted-foreground">
            {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title}>
                    <h4 className="font-semibold text-foreground mb-2">{title}</h4>
                    <ul className="space-y-1">
                        {links.map(link => <li key={link}><Link href="#" className="hover:text-primary">{link}</Link></li>)}
                    </ul>
                </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-border text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Videomatics AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
