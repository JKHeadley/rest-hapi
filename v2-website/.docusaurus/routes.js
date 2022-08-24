import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '0c7'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', 'bd3'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', '333'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', '3b1'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '2b5'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', 'a00'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', 'b55'),
    exact: true
  },
  {
    path: '/blog',
    component: ComponentCreator('/blog', '81f'),
    exact: true
  },
  {
    path: '/blog/2016/11/19/The-Problem-With-APIs',
    component: ComponentCreator('/blog/2016/11/19/The-Problem-With-APIs', '393'),
    exact: true
  },
  {
    path: '/blog/2017/02/17/The-Problem-With-MongoDB',
    component: ComponentCreator('/blog/2017/02/17/The-Problem-With-MongoDB', 'c58'),
    exact: true
  },
  {
    path: '/blog/2018/06/26/How-To-Build-Powerful-APIs-Blazingly-Fast-With-Nodejs',
    component: ComponentCreator('/blog/2018/06/26/How-To-Build-Powerful-APIs-Blazingly-Fast-With-Nodejs', 'f4f'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', '1d1'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', 'e87'),
    exact: true
  },
  {
    path: '/docs/1.6.x',
    component: ComponentCreator('/docs/1.6.x', '5e0'),
    routes: [
      {
        path: '/docs/1.6.x/version-1.6.x-associations',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-associations', '6c3'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-audit-logs',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-audit-logs', '52c'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-authentication',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-authentication', 'c4e'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-authorization',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-authorization', '8a6'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-configuration',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-configuration', '555'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-creating-endpoints',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-creating-endpoints', 'e7f'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-duplicate-fields',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-duplicate-fields', '848'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-introduction',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-introduction', '517'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-metadata',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-metadata', '4cc'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-middleware',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-middleware', '0c7'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-misc',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-misc', '674'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-model-generation',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-model-generation', 'c79'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-mongoose-wrapper-methods',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-mongoose-wrapper-methods', 'dce'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-policies',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-policies', '223'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-querying',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-querying', 'e17'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-questions',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-questions', '551'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-quick-start',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-quick-start', 'cca'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-route-customization',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-route-customization', 'f95'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-soft-delete',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-soft-delete', '3e0'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-support',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-support', 'cae'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-swagger-documentation',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-swagger-documentation', '4f2'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-testing',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-testing', '6cd'),
        exact: true
      },
      {
        path: '/docs/1.6.x/version-1.6.x-validation',
        component: ComponentCreator('/docs/1.6.x/version-1.6.x-validation', 'd73'),
        exact: true
      }
    ]
  },
  {
    path: '/docs/1.7.x',
    component: ComponentCreator('/docs/1.7.x', '323'),
    routes: [
      {
        path: '/docs/1.7.x/version-1.7.x-mongoose-wrapper-methods',
        component: ComponentCreator('/docs/1.7.x/version-1.7.x-mongoose-wrapper-methods', '76d'),
        exact: true
      },
      {
        path: '/docs/1.7.x/version-1.7.x-policies',
        component: ComponentCreator('/docs/1.7.x/version-1.7.x-policies', '04a'),
        exact: true
      },
      {
        path: '/docs/1.7.x/version-1.7.x-validation',
        component: ComponentCreator('/docs/1.7.x/version-1.7.x-validation', 'db0'),
        exact: true
      }
    ]
  },
  {
    path: '/docs/2.0.x',
    component: ComponentCreator('/docs/2.0.x', '8bc'),
    routes: [
      {
        path: '/docs/2.0.x/version-2.0.x-configuration',
        component: ComponentCreator('/docs/2.0.x/version-2.0.x-configuration', '129'),
        exact: true
      },
      {
        path: '/docs/2.0.x/version-2.0.x-creating-endpoints',
        component: ComponentCreator('/docs/2.0.x/version-2.0.x-creating-endpoints', '777'),
        exact: true
      },
      {
        path: '/docs/2.0.x/version-2.0.x-introduction',
        component: ComponentCreator('/docs/2.0.x/version-2.0.x-introduction', 'ba6'),
        exact: true
      },
      {
        path: '/docs/2.0.x/version-2.0.x-policies',
        component: ComponentCreator('/docs/2.0.x/version-2.0.x-policies', 'b4d'),
        exact: true
      },
      {
        path: '/docs/2.0.x/version-2.0.x-querying',
        component: ComponentCreator('/docs/2.0.x/version-2.0.x-querying', '732'),
        exact: true
      },
      {
        path: '/docs/2.0.x/version-2.0.x-quick-start',
        component: ComponentCreator('/docs/2.0.x/version-2.0.x-quick-start', '445'),
        exact: true
      },
      {
        path: '/docs/2.0.x/version-2.0.x-validation',
        component: ComponentCreator('/docs/2.0.x/version-2.0.x-validation', '75d'),
        exact: true
      }
    ]
  },
  {
    path: '/docs/next',
    component: ComponentCreator('/docs/next', 'af5'),
    routes: [
      {
        path: '/docs/next/associations',
        component: ComponentCreator('/docs/next/associations', '9e2'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/audit-logs',
        component: ComponentCreator('/docs/next/audit-logs', 'b40'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/authentication',
        component: ComponentCreator('/docs/next/authentication', '94c'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/authorization',
        component: ComponentCreator('/docs/next/authorization', '15e'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/configuration',
        component: ComponentCreator('/docs/next/configuration', '61c'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/creating-endpoints',
        component: ComponentCreator('/docs/next/creating-endpoints', '31b'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/duplicate-fields',
        component: ComponentCreator('/docs/next/duplicate-fields', 'aea'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/introduction',
        component: ComponentCreator('/docs/next/introduction', '172'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/metadata',
        component: ComponentCreator('/docs/next/metadata', '022'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/middleware',
        component: ComponentCreator('/docs/next/middleware', '5fb'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/misc',
        component: ComponentCreator('/docs/next/misc', '94a'),
        exact: true
      },
      {
        path: '/docs/next/model-generation',
        component: ComponentCreator('/docs/next/model-generation', '08c'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/mongoose-wrapper-methods',
        component: ComponentCreator('/docs/next/mongoose-wrapper-methods', '5fa'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/policies',
        component: ComponentCreator('/docs/next/policies', 'a8e'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/querying',
        component: ComponentCreator('/docs/next/querying', '2ce'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/questions',
        component: ComponentCreator('/docs/next/questions', '403'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/quick-start',
        component: ComponentCreator('/docs/next/quick-start', '4f6'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/route-customization',
        component: ComponentCreator('/docs/next/route-customization', '27b'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/soft-delete',
        component: ComponentCreator('/docs/next/soft-delete', 'f9e'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/support',
        component: ComponentCreator('/docs/next/support', '2a6'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/swagger-documentation',
        component: ComponentCreator('/docs/next/swagger-documentation', 'f6c'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/testing',
        component: ComponentCreator('/docs/next/testing', '9cd'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/next/validation',
        component: ComponentCreator('/docs/next/validation', 'c14'),
        exact: true,
        sidebar: "docs"
      }
    ]
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'eca'),
    routes: [
      {
        path: '/docs/associations',
        component: ComponentCreator('/docs/associations', 'f05'),
        exact: true
      },
      {
        path: '/docs/audit-logs',
        component: ComponentCreator('/docs/audit-logs', '86a'),
        exact: true
      },
      {
        path: '/docs/authentication',
        component: ComponentCreator('/docs/authentication', '0a7'),
        exact: true
      },
      {
        path: '/docs/authorization',
        component: ComponentCreator('/docs/authorization', '27e'),
        exact: true
      },
      {
        path: '/docs/creating-endpoints',
        component: ComponentCreator('/docs/creating-endpoints', 'e45'),
        exact: true
      },
      {
        path: '/docs/duplicate-fields',
        component: ComponentCreator('/docs/duplicate-fields', '3fc'),
        exact: true
      },
      {
        path: '/docs/introduction',
        component: ComponentCreator('/docs/introduction', '596'),
        exact: true
      },
      {
        path: '/docs/metadata',
        component: ComponentCreator('/docs/metadata', 'a54'),
        exact: true
      },
      {
        path: '/docs/middleware',
        component: ComponentCreator('/docs/middleware', '497'),
        exact: true
      },
      {
        path: '/docs/misc',
        component: ComponentCreator('/docs/misc', 'c6b'),
        exact: true
      },
      {
        path: '/docs/model-generation',
        component: ComponentCreator('/docs/model-generation', '78d'),
        exact: true
      },
      {
        path: '/docs/mongoose-wrapper-methods',
        component: ComponentCreator('/docs/mongoose-wrapper-methods', '2ef'),
        exact: true
      },
      {
        path: '/docs/policies',
        component: ComponentCreator('/docs/policies', '095'),
        exact: true
      },
      {
        path: '/docs/querying',
        component: ComponentCreator('/docs/querying', '68e'),
        exact: true
      },
      {
        path: '/docs/questions',
        component: ComponentCreator('/docs/questions', '93c'),
        exact: true
      },
      {
        path: '/docs/quick-start',
        component: ComponentCreator('/docs/quick-start', '3db'),
        exact: true
      },
      {
        path: '/docs/route-customization',
        component: ComponentCreator('/docs/route-customization', '861'),
        exact: true
      },
      {
        path: '/docs/soft-delete',
        component: ComponentCreator('/docs/soft-delete', '9e4'),
        exact: true
      },
      {
        path: '/docs/support',
        component: ComponentCreator('/docs/support', '296'),
        exact: true
      },
      {
        path: '/docs/swagger-documentation',
        component: ComponentCreator('/docs/swagger-documentation', 'd2a'),
        exact: true
      },
      {
        path: '/docs/testing',
        component: ComponentCreator('/docs/testing', '1ad'),
        exact: true
      },
      {
        path: '/docs/validation',
        component: ComponentCreator('/docs/validation', '696'),
        exact: true
      },
      {
        path: '/docs/version-2.3.x-configuration',
        component: ComponentCreator('/docs/version-2.3.x-configuration', 'e7a'),
        exact: true
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'b08'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
