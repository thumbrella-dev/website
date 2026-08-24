/**
 * Structured data (JSON-LD) for thumbrella.dev.
 *
 * The SoftwareApplication schema describes Thumbrella as a whole and is
 * injected into the homepage <head>. Add or tweak fields here.
 */
export const siteSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Thumbrella",
  url: "https://thumbrella.dev",
  image: {
    "@type": "ImageObject",
    url: "https://thumbrella.dev/thumbrella.png",
    name: "Thumbrella logo",
    caption: "Official logo for thumbrella.dev",
    width: 224,
    height: 224,
  },
  sameAs: [
    "https://demo.thumbrella.dev",
    "https://github.com/thumbrella-dev/thumbrella",
    "https://www.npmjs.com/package/@thumbrella/client",
    "https://pypi.org/project/thumbrella-client/",
    "https://crates.io/crates/thumbrella-client",
    "https://hub.docker.com/r/thumbrella/server",
  ],

};
