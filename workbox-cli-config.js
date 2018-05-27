module.exports = {
  "globDirectory": "public/",
  "globPatterns": [
    "**/*.{html,ico,json,css}",
    "src/images/*.{jpg,png}",
    "src/js/*.min.js",
    "workbox-sw.prod.v2.1.3.js"
  ],
  "swSrc": "public/sw-base.js",
  "swDest": "public/service-worker.js",
  "globIgnores": [
    "../workbox-cli-config.js",
    "help/**",
    "404.html"
  ]
};
