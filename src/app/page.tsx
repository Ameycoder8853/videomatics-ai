"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import {
  Wand2,
  Mic,
  Sparkles,
  MonitorPlay,
  LayoutGrid,
  Download,
  ArrowRight,
  Play,
  Zap,
  Clock,
} from "lucide-react";


const whyChooseFeatures = [
  {
    icon: Zap,
    title: "AI-Powered Generation",
    desc: "Advanced AI creates professional videos from your ideas in minutes.",
    color: "text-blue-400",
  },
  {
    icon: Clock,
    title: "Lightning Fast",
    desc: "Generate complete videos in under 2 minutes with our optimized pipeline.",
    color: "text-purple-400",
  },
  {
    icon: Sparkles,
    title: "Multiple Styles",
    desc: "Choose from casual to professional styles that match your brand.",
    color: "text-pink-400",
  },
];


const howItWorks = [
  {
    step: "01",
    title: "Describe Your Vision",
    description: "Start with your idea, topic, or a simple prompt.",
  },
  {
    step: "02",
    title: "Let AI Do the Work",
    description: "Videomatics handles voiceovers, visuals, and timing.",
  },
  {
    step: "03",
    title: "Preview & Download",
    description: "Review, render in your browser, and download instantly.",
  },
];

const stats = [
  { number: "5000+", label: "Active Users" },
  { number: "20,000+", label: "Videos Generated" },
  { number: "99%", label: "Satisfaction Rate" },
  { number: "24/7", label: "Customer Support" },
];

const testimonials = [
  {
    quote: "Videomatics AI has made my content creation 10x faster. Perfect for my Instagram reels.",
    author: "Amey Patil",
    role: "Founder & Creator",
  },
  {
    quote: "I use this tool daily for YouTube shorts. The voice and script quality is insane.",
    author: "Priya K.",
    role: "YouTuber",
  },
  {
    quote: "My agency saves hours per video. We now scale short-form content for clients easily.",
    author: "Rahul S.",
    role: "Agency Owner",
  },
];


const integrations = [
  "YouTube", "Instagram", "TikTok", "Firebase", "Razorpay", 
  "Remotion", "AssemblyAI", "Gemini AI"
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
    a: "Yes, rendered videos can be downloaded directly from your browser."
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        } transition-all duration-1000`}
      >
        <div className="space-y-20">
          {/* Hero Section */}
          <section className="text-center space-y-8 pt-16 md:pt-24">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight font-headline">
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Create Stunning Videos
              </span>
              <br />
              with AI Magic
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your ideas into professional videos in minutes. No editing skills required. Just describe what you want, and our AI handles the rest.
            </p>
            <div className="flex justify-center items-center flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg px-6 py-3 transition-transform hover:scale-105 shadow-lg shadow-primary/20">
                <Link href="/dashboard">
                  Start Creating Videos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-muted-foreground/50 hover:bg-muted/50 hover:border-muted-foreground rounded-lg px-6 py-3 transition-transform hover:scale-105">
                <a href="#video-tutorial" onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('video-tutorial')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </a>
              </Button>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section id="why-choose-us" className="text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Why Choose Videomatics AI?</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Powerful AI technology meets intuitive design to deliver an exceptional video creation experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {whyChooseFeatures.map((item, index) => (
                <div
                  key={index}
                  className="bg-card/50 p-8 rounded-xl border border-border/20 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 bg-card rounded-full`}>
                      <item.icon className={`h-8 w-8 ${item.color}`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
          
           {/* How It Works Section */}
          <section className="space-y-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center font-headline">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
              {howItWorks.map((item) => (
                <div key={item.step} className="relative p-6 border rounded-xl overflow-hidden bg-card/50 hover:shadow-lg hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="text-6xl font-bold text-muted/20 absolute -top-2 -left-2 select-none">
                    {item.step}
                  </div>
                  <div className="relative z-10 pt-8">
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center hover:scale-105 transition-transform duration-200">
                <div className="text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </section>

          {/* Video Tutorial Section */}
          <section id="video-tutorial" className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">See Videomatics AI in Action</h2>
            <p className="text-muted-foreground mb-4">
              Watch this short video to see how easily you can create AI videos.
            </p>
            <div className="flex justify-center">
              <div className="relative w-full md:w-[80%] lg:w-[70%] rounded-xl overflow-hidden shadow-2xl shadow-primary/20 border-2 border-primary/20"
                style={{
                    background: 'radial-gradient(circle, hsla(var(--primary), 0.1) 0%, transparent 60%)'
                }}
              >
                <video
                  controls
                  className="w-full h-auto rounded-xl"
                  poster="https://placehold.co/1280x720.png"
                  data-ai-hint="tutorial video"
                >
                  <source src="https://cdn.pixabay.com/video/2023/04/19/160294-823678247_large.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/50 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">What Creators Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 border"
                >
                  <p className="text-muted-foreground italic mb-4">"{t.quote}"</p>
                  <div className="font-semibold text-foreground">{t.author}</div>
                  <div className="text-muted-foreground text-sm">{t.role}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-xl p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">Ready to Create AI-Powered Videos?</h2>
            <p className="text-lg mb-8 opacity-90">Join Videomatics AI and transform your content game.</p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium rounded-full text-lg px-8 py-4 transition hover:scale-105"
            >
              <Link href="/dashboard">Get Started for Free</Link>
            </Button>
          </section>

          <section className="text-center space-y-10">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Seamless Integrations</h2>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center font-headline">Frequently Asked Questions</h2>
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

      <footer className="bg-card py-12 mt-20 border-t border-border">
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
