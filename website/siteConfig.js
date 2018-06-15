/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This sourcecs/site-config.html for all the possible
// site configuration options. code is licensed under the MIT license found in the
//  * LICENSE file in the root directory of this source tree.
//  */
//
// // See https://docusaurus.io/do

/* List of projects/orgs using your project for the users page */
const users = require('./data/users')

const siteConfig = {
  title: 'rest-hapi' /* title for your website */,
  tagline: 'A RESTful API generator ',
  url: 'https://jkheadley.github.io' /* your website url */,
  baseUrl: '/rest-hapi/' /* base url for your project */,
  repoUrl: 'https://github.com/JKHeadley/rest-hapi',
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'rest-hapi',
  organizationName: 'JKHeadley',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'getting-started', label: 'Docs' },
    // {doc: 'doc4', label: 'API'},
    { page: 'help', label: 'Help' },
    { blog: true, label: 'Blog' },
    { page: 'users', label: 'Users' },
    {
      href: 'https://github.com/JKHeadley/rest-hapi',
      label: 'GitHub'
    }
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/rest-hapi-logo.png',
  footerIcon: 'img/rest-hapi-logo-alt.png',
  favicon: 'img/rest-hapi-logo-alt.png',

  /* colors for website */
  // colors: {
  //   primaryColor: '#195085',
  //   secondaryColor: '#0d385c',
  // },

  colors: {
    primaryColor: '#f6941e',
    secondaryColor: '#f9ad00'
  },

  /* custom fonts for website */
  /* fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  }, */

  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright: 'Copyright © ' + new Date().getFullYear() + ' Justin Headley',

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'atom-one-dark'
  },

  // Add custom scripts here that would be placed in <script> tags
  scripts: ['https://buttons.github.io/buttons.js'],

  /* On page navigation for the current documentation page */
  onPageNav: 'separate',

  /* Open Graph and Twitter card images */
  ogImage: 'img/rest-hapi-logo-alt.png',
  twitterImage: 'img/rest-hapi-logo-alt.png',

  scrollToTop: true,

  scrollToTopOptions: {
    zIndex: 1000
  },

  editUrl: 'https://github.com/JKHeadley/rest-hapi/tree/master/docs/'
  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
}

module.exports = siteConfig
