# **App Name**: VividVerse

## Core Features:

- AI Script Generation: Generate video scripts based on user-selected topic, style, and duration using Gemini; the tool decides when and if to incorporate the video style and/or duration.
- AI Image Generation: Generate relevant images from the script using Replicate's SDXL-Lightning.
- AI Audio Generation: Generate audio from the script using ElevenLabs TTS.
- AI Captions Generation: Generate captions from the audio using AssemblyAI.
- Video Preview: Display video preview using Remotion's Player component.
- In-Browser Video Rendering: Render and allow download of video in the browser using `@remotion/renderer`.
- Firebase Integration: Enable user authentication and store generated videos, thumbnails, and audio in Firebase Storage.

## Style Guidelines:

- Primary color: Deep purple (#673AB7) for a modern, creative feel.
- Background color: Very light purple (#F3E5F5).
- Accent color: Dark blue (#3F51B5) to complement the primary and provide contrast for interactive elements.
- Headline font: 'Poppins' (sans-serif) for a clean, geometric style. Body text: 'Inter' (sans-serif).
- Use simple, outlined icons from the Lucid or Google Material icon sets.
- Use a grid-based layout with a clean, modern design, leveraging Shadcn UI components. Ensure responsiveness for various screen sizes.
- Use subtle animations and transitions to enhance user experience without being distracting.