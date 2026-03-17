@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&display=swap');
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Courier Prime", ui-monospace, SFMono-Regular, monospace;
}

body {
  @apply bg-[#f4f4f4];
}