module.exports = {
  content: [
    "./_includes/**/*.njk",
    "./_layouts/**/*.njk",
    "./posts/**/*.md",
    "./index.njk",
    "./js/**/*.js"
  ],
  safelist: [
    // Caption classes
    'absolute',
    'bottom-[0]',
    'left-0',
    'w-full',
    'p-2',
    'bg-white',
    'text-black',
    'text-sm',
    'text-left',
    'rounded-b-md',
    'z-10',
    'pointer-events-none',
    // New caption part classes
    'block',
    'font-bold',
    'mt-1',
    'overflow-hidden',
	'rounded-md',
    // Add any other needed classes here
    // Arrow size classes
    'text-5xl',
    'p-3',
    'md:p-4',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
