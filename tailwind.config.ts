import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				// System colors
				desktop: {
					bg: 'hsl(var(--desktop-bg))'
				},
				panel: {
					bg: 'hsl(var(--panel-bg))',
					fg: 'hsl(var(--panel-fg))'
				},
				window: {
					bg: 'hsl(var(--window-bg))',
					header: 'hsl(var(--window-header))',
					border: 'hsl(var(--window-border))'
				},
				dock: {
					bg: 'hsl(var(--dock-bg))',
					hover: 'hsl(var(--dock-hover))',
					active: 'hsl(var(--dock-active))'
				},
				terminal: {
					bg: 'hsl(var(--terminal-bg))',
					fg: 'hsl(var(--terminal-fg))',
					cursor: 'hsl(var(--terminal-cursor))'
				},
				file: {
					bg: 'hsl(var(--file-bg))',
					hover: 'hsl(var(--file-hover))',
					selected: 'hsl(var(--file-selected))'
				},
				
				// UI colors
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				
				// Status colors
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				error: 'hsl(var(--error))',
				info: 'hsl(var(--info))',
				
				// Component colors
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-wallpaper': 'var(--gradient-wallpaper)',
				'gradient-dock': 'var(--gradient-dock)',
				'gradient-window': 'var(--gradient-window)'
			},
			boxShadow: {
				'window': 'var(--shadow-window)',
				'dock': 'var(--shadow-dock)',
				'panel': 'var(--shadow-panel)'
			},
			fontFamily: {
				'system': 'var(--font-system)',
				'mono': 'var(--font-mono)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
