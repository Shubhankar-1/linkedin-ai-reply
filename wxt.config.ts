import { defineConfig } from 'wxt';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    action: {
      default_title: 'LinkedIn AI Reply',
    },
    name:"LinkedIn AI Reply",
    description: "Chrome extension to generate replies in LinkedIn messages ",
    permissions: ["activeTab", "scripting"],
    host_permissions: ["*://www.linkedin.com/*"],
    content_scripts: [
      {
        "matches": ["*://www.linkedin.com/*"],
        "js": ["/content-scripts/content.js"],
        "css": ["/content-scripts/content.css"]
      }
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline';"
    },
    web_accessible_resources: [
      {
        matches: ["*://www.linkedin.com/*"],
        resources: ['icon/*.png', "Frame.png"]
      },
    ],
  },
  vite: () => ({
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
        ],
      },
    },
  }),
});
