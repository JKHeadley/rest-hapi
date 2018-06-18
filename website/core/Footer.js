/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl
    return baseUrl + 'docs/' + (language ? language + '/' : '') + doc
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl
    return baseUrl + (language ? language + '/' : '') + doc
  }

  render() {
    const currentYear = new Date().getFullYear()
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('quick-start.html', this.props.language)}>
              Getting Started
            </a>
            <a href={this.docUrl('configuration.html', this.props.language)}>
              Usage
            </a>
            <a href={this.docUrl('testing.html', this.props.language)}>Other</a>
          </div>
          <div>
            <h5>Community</h5>
            <a href={this.pageUrl('users.html', this.props.language)}>
              User Showcase
            </a>
            <a
              href="https://stackoverflow.com/search?q=rest-hapi"
              target="_blank"
              rel="noreferrer noopener">
              Stack Overflow
            </a>
            <a href="https://gitter.im/rest-hapi">Project Chat</a>
            <a
              href="https://twitter.com/resthapi"
              target="_blank"
              rel="noreferrer noopener">
              Twitter
            </a>
          </div>
          <div>
            <h5>More</h5>
            <a href="https://opencollective.com/rest-hapi">Donate</a>
            <a href={this.props.config.baseUrl + 'blog'}>Blog</a>
            <a href="https://github.com/JKHeadley/rest-hapi">GitHub</a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/JKHeadley/rest-hapi/stargazers"
              data-show-count={true}
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub">
              Star
            </a>
            <a href="https://twitter.com/intent/tweet?text=Generate%20RESTful%20API%20endpoints%20with%20rest-hapi!&url=https://resthapi.com&via=resthapi&hashtags=REST,API,mongoosejs,hapijs,nodejs,MongoDB">
              <img alt="rest-hapi tweet" src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social"/>
            </a>
          </div>
        </section>
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    )
  }
}

module.exports = Footer
