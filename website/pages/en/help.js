/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

const siteConfig = require(process.cwd() + '/siteConfig.js')

function docUrl(doc, language) {
  return siteConfig.baseUrl + 'docs/' + (language ? language + '/' : '') + doc
}

class Help extends React.Component {
  render() {
    let language = this.props.language || ''
    const supportLinks = [
      {
        content: `Learn more about rest-hapi using the [documentation on this site.](${docUrl(
          'quick-start.html',
          null
        )})`,
        title: 'Browse the docs'
      },
      {
        content:
          'Ask questions about the documentation and project. Join the conversation on [gitter](https://gitter.im/rest-hapi/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)!',
        title: 'Gitter'
      },
      {
        content:
          'You can follow and contact us on [Twitter](https://twitter.com/resthapi).',
        title: 'Twitter'
      },
      {
        content:
          'At our [GitHub repo](https://github.com/JKHeadley/rest-hapi) Browse and submit [issues](https://github.com/JKHeadley/rest-hapi/issues) or [pull requests](https://github.com/JKHeadley/rest-hapi/pulls) for bugs you find or any new features you may want implemented. Be sure to also check out our [contributing information](https://github.com/JKHeadley/rest-hapi/blob/master/CONTRIBUTING.md).',
        title: 'GitHub'
      }
    ]

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h2>Need help?</h2>
            </header>
            <p>
              If you need help with rest-hapi, you can try one of the mechanisms
              below.
            </p>
            <GridBlock contents={supportLinks} layout="fourColumn" />
          </div>
        </Container>
      </div>
    )
  }
}

module.exports = Help
