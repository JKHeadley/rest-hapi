module.exports = {
  title: 'rest-hapi',
  tagline: 'A RESTful API generator ',
  url: 'https://resthapi.com',
  baseUrl: '/',
  organizationName: 'JKHeadley',
  projectName: 'rest-hapi',
  scripts: ['https://buttons.github.io/buttons.js'],
  favicon: 'img/rest-hapi-logo-alt.png',
  customFields: {
    repoUrl: 'https://github.com/JKHeadley/rest-hapi',
    users: [
      {
        caption: 'appy',
        image: '/img/appy.png',
        infoLink: 'https://www.appyapp.io',
        pinned: true
      }
    ],
    facebookAppId: '2157963944448868'
  },
  onBrokenLinks: 'log',
  onBrokenMarkdownLinks: 'log',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          editUrl: 'https://github.com/JKHeadley/rest-hapi/tree/master/docs/',
          path: '../docs',
          sidebarPath: '../website/sidebars.json'
        },
        blog: {
          path: 'blog'
        },
        theme: {
          customCss: '../src/css/customTheme.css'
        },
        googleAnalytics: {
          trackingID: 'UA-120977991-1'
        }
      }
    ]
  ],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        fromExtensions: ['html']
      }
    ]
  ],
  themeConfig: {
    navbar: {
      title: 'rest-hapi',
      logo: {
        src: 'img/rest-hapi-logo.png'
      },
      items: [
        {
          to: 'docs/quick-start',
          label: 'Docs',
          position: 'left'
        },
        {
          to: '/help',
          label: 'Help',
          position: 'left'
        },
        {
          to: '/users',
          label: 'Users',
          position: 'left'
        },
        {
          href: 'https://github.com/JKHeadley/rest-hapi',
          label: 'GitHub',
          position: 'left'
        }
      ]
    },
    image: 'img/rest-hapi-logo-alt.png',
    footer: {
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Twitter',
              to: 'https://twitter.com/resthapi'
            }
          ]
        }
      ],
      copyright: 'Copyright © 2022 Justin Headley',
      logo: {
        src: 'img/rest-hapi-logo-alt.png'
      }
    },
    algolia: {
      appId: 'FF4AW2N6KF',
      apiKey: '57350aeeab14b0032cbf5875b595aa48',
      indexName: 'rest_hapi',
      algoliaOptions: {}
    }
  }
}
