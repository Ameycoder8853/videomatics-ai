"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import {
  Wand2,
  ImageIcon,
  Mic,
  Palette,
  Zap,
  Film,
  PlayCircle,
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI Scripting",
    desc: "Craft compelling narratives based on your topic, style, and desired length.",
  },
  {
    icon: ImageIcon,
    title: "Visual Generation",
    desc: "Bring your script to life with AI-generated images that match your story.",
  },
  {
    icon: Mic,
    title: "AI Voiceovers",
    desc: "Add professional voiceovers using advanced text-to-speech technology.",
  },
  {
    icon: Palette,
    title: "Easy Customization",
    desc: "Tailor colors, fonts, and pacing to match your brand or vision.",
  },
];

const howItWorks = [
  {
    icon: Zap,
    step: "STEP 1",
    title: "Describe Your Video",
    desc: "Provide a topic, choose a style, and set your desired video length and pace.",
  },
  {
    icon: Film,
    step: "STEP 2",
    title: "AI Generates Assets",
    desc: "Our AI crafts a script, generates visuals, and creates a voiceover for your story.",
  },
  {
    icon: PlayCircle,
    step: "STEP 3",
    title: "Preview & Download",
    desc: "Review your AI-generated video, make tweaks if needed, and download your masterpiece.",
  },
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

          <section id="features" className="space-y-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center">Features That Shine</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((item, index) => (
                <div key={index} className="bg-card/50 p-6 rounded-lg shadow-md transition-all hover:shadow-xl hover:scale-105 border border-transparent hover:border-primary/50 text-center">
                  <div className="flex justify-center mb-4">
                     <div className="p-3 bg-primary/10 rounded-lg">
                        <item.icon className="h-8 w-8 text-primary" />
                     </div>
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="how-it-works" className="space-y-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {howItWorks.map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-bold text-primary">{item.step}</p>
                  <h3 className="text-xl font-semibold text-card-foreground mt-2 mb-2">{item.title}</h3>
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
