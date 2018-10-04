const PropTypes = require('prop-types');
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const SocialFooter = props => (
  <div>
    <h5>Social</h5>
    <div className="social">
      <a
        className="github-button" // part of the https://buttons.github.io/buttons.js script in siteConfig.js
        href={`https://github.com/${props.config.organizationName}/${
          props.config.projectName
          }`}
        data-count-href={`/${props.config.organizationName}/${
          props.config.projectName
          }/stargazers`}
        data-show-count="true"
        data-count-aria-label="# stargazers on GitHub"
        aria-label="Star this project on GitHub">
        {props.config.projectName}
      </a>
    </div>
    <div className="social">
      <a href="https://twitter.com/intent/tweet?text=Generate%20RESTful%20API%20endpoints%20with%20rest-hapi!&url=https://resthapi.com&via=resthapi&hashtags=mongoosejs,hapijs,nodejs,MongoDB">
        <img alt="rest-hapi tweet" src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social"/>
      </a>
    </div>
    {props.config.twitterUsername && (
      <div className="social">
        <a
          href={`https://twitter.com/${props.config.twitterUsername}`}
          className="twitter-follow-button">
          Follow @{props.config.twitterUsername}
        </a>
      </div>
    )}
    {props.config.facebookAppId && (
      <div className="social">
        <div
          className="fb-like"
          data-href={props.config.url}
          data-layout="standard"
          data-share="true"
          data-width="225"
          data-show-faces="false"
        />
      </div>
    )}
  </div>
);

SocialFooter.propTypes = {
  config: PropTypes.object,
};

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
            <a href={this.docUrl('quick-start.html', null)}>
              Getting Started
            </a>
            <a href={this.docUrl('configuration.html', null)}>
              Usage
            </a>
            <a href={this.docUrl('testing.html', null)}>Other</a>
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
            <a href="https://opencollective.com/rest-hapi">Donate</a>
            <a href={this.props.config.baseUrl + 'blog'}>Blog</a>
          </div>
          <SocialFooter config={this.props.config} />
        </section>
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    )
  }
}

module.exports = Footer
