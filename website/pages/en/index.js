/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')
// const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
// const Container = CompLibrary.Container;
// const GridBlock = CompLibrary.GridBlock;
//
// const translate = require('../../server/translate.js').translate;

const translation = require('../../server/translation.js') // eslint-disable-line import/no-unresolved
const {
  Container,
  GridBlock,
  MarkdownBlock
} = require('../../core/CompLibrary') // eslint-disable-line import/no-unresolved
const { translate } = require('../../server/translate') // eslint-disable-line import/no-unresolved

const siteConfig = require(process.cwd() + '/siteConfig.js')

function imgUrl(img) {
  return siteConfig.baseUrl + 'img/' + img
}

function docUrl(doc, language) {
  return siteConfig.baseUrl + 'docs/' + (language ? language + '/' : '') + doc
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? language + '/' : '') + page
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    )
  }
}

Button.defaultProps = {
  target: '_self'
}

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
)

const Logo = props => (
  <div className="projectLogo">
    <img src={props.img_src} />
  </div>
)

const ProjectTitle = props => (
  <h2 className="projectTitle">
    {siteConfig.title}
    <small>{siteConfig.tagline}</small>
  </h2>
)

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
)

class HomeSplash extends React.Component {
  render() {
    let language = this.props.language || ''
    return (
      <SplashContainer>
        <div className="inner">
          <h2 className="projectTitle">
            <img title="rest-hapi" src={imgUrl('rest-hapi-logo-alt.png')} />
          </h2>
          {/* <Logo img_src={imgUrl('rest-hapi-logo-alt.png')} /> */}
          <ProjectTitle />
          <PromoSection>
            <Button href="#try">Try It Out</Button>
            <Button href={docUrl('quick-start.html', language)}>
              Get Started
            </Button>
          </PromoSection>
          <a
            className="github-button"
            href={siteConfig.repoUrl}
            data-icon="octicon-star"
            data-count-href="/JKHeadley/rest-hapi/stargazers"
            data-show-count={true}
            data-count-aria-label="# stargazers on GitHub"
            aria-label="Star this project on GitHub">
            Star
          </a>
        </div>
      </SplashContainer>
    )
  }
}

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}>
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
)

const Features = props => (
  <Block layout="fourColumn">
    {[
      {
        content:
          'Customize endpoints with configuration based features and hapi plugins.',
        image: imgUrl('flexible_icon.png'),
        imageAlign: 'top',
        title: 'Flexible'
      },
      {
        content:
          'Relational structure built into NoSQL documents based on mongoose schemas.',
        image: imgUrl('powerful_icon.png'),
        imageAlign: 'top',
        title: 'Powerful'
      },
      {
        content:
          'Less time with boilerplate functionality and more time building awesome APIs!',
        image: imgUrl('efficient_icon.png'),
        imageAlign: 'top',
        title: 'Efficient'
      }
    ]}
  </Block>
)

const FeatureCallout = props => (
  <div
    className="productShowcaseSection paddingBottom"
    style={{ textAlign: 'center' }}>
    <h2>What does it do?</h2>
    <MarkdownBlock>
      rest-hapi uses [mongoose](http://mongoosejs.com/) schemas to generate
      [CRUD](docs/creating-endpoints.html) and
      [association](docs/associations.html) REST API endpoints on a [hapi](https://hapijs.com/) server. Generating the
      endpoints allows for a rich set of [configurable](docs/configuration.html)
      features such as:
    </MarkdownBlock>
  </div>
)

const FeaturesList = props => (
  <Block background="light">
    {[
      {
        content: `
- [Middleware](docs/middleware.html) support
- Query parameter, header, payload, and response [validation](docs/validation.html) using [joi](https://github.com/hapijs/joi)
- Route-level and document-level [authorization](docs/authorization.html)
- [Swagger docs](docs/swagger-documentation.html) via [hapi-swagger](https://github.com/glennjones/hapi-swagger)
- [Query parameter](docs/querying.html) support for searching, sorting, filtering, pagination, and [embedding of associated models](docs/querying.html#populate-nested-associations)
- Endpoint activity history through [Audit Logs](docs/audit-logs.html)
- Support for [policies](docs/policies.html) via [mrhorse](https://github.com/mark-bradshaw/mrhorse)
- [Duplicate fields](docs/duplicate-fields.html)
- Support for ["soft" delete](docs/soft-delete.html)
- Optional [metadata](docs/metadata.html)
`,
        image: imgUrl('docusaurus.svg'),
        imageAlign: 'right',
        title: 'Learn How'
      }
    ]}
  </Block>
)

const sh = (...args) => `~~~sh\n${String.raw(...args)}\n~~~`

const Querying = props => {
  return (
    <Container padding={['bottom', 'top']} background="light">
      <div className="gridBlock">
        <div className="blockElement imageAlignSide imageAlignRight twoByGridBlock">
          <div className="blockContent">
            <h2>
              <div>
                <span>
                  <p>
                    <a href="docs/querying.html">Querying</a>
                  </p>
                </span>
              </div>
            </h2>
            <div>
              <span>
                <MarkdownBlock>
                  Search, sort, filter, paginate, and [embed associated
                  data](docs/querying.html#populate-nested-associations).
                </MarkdownBlock>
                <div className="blockContentHighlight">
                  <MarkdownBlock>{sh`http get :8080/user \$limit==2 \$sort==email \$embed==role`}</MarkdownBlock>
                </div>
              </span>
            </div>
          </div>
          <div className="blockImage">
            <img src="/img/querying.png" />
          </div>
        </div>
      </div>
    </Container>
  )
}

const Validation = props => {
  return (
    <Container padding={['bottom', 'top']} background="dark">
      <div className="gridBlock">
        <div className="blockElement alignCenter imageAlignSide imageAlignLeft twoByGridBlock">
          <div className="blockImage">
            <a href="https://github.com/hapijs/joi">
              <img src="/img/joi.png" />
            </a>
          </div>
          <div className="blockContent">
            <h2>
              <div>
                <span>
                  <p>
                    <a href="docs/validation.html">Validation</a>
                  </p>
                </span>
              </div>
            </h2>
            <div>
              <span>
                <MarkdownBlock>
                  Query parameter, header, payload, and response
                  [validation](docs/validation.html) using
                  [joi](https://github.com/hapijs/joi).
                </MarkdownBlock>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

const Swagger = props => {
  return (
    <Container padding={['bottom', 'top']} background="light">
      <div className="gridBlock">
        <div className="blockElement imageAlignSide imageAlignRight twoByGridBlock">
          <div className="blockContent">
            <h2>
              <div>
                <span>
                  <p>
                    <a href="docs/swagger-documentation.html">Swagger</a>
                  </p>
                </span>
              </div>
            </h2>
            <div>
              <span>
                <MarkdownBlock>
                  [Swagger docs](docs/swagger-documentation.html) provide a UI
                  for your endpoints so you can easily interact with your data.
                </MarkdownBlock>
              </span>
            </div>
          </div>
          <div className="blockImage screenshot">
            <a href="https://api.appyapp.io">
              <img src="/img/appy-api-screenshot.png" />
            </a>
          </div>
        </div>
      </div>
    </Container>
  )
}

const TryOut = props => {
  return (
    <Container
      padding={['bottom', 'top']}
      background="dark"
      align={'center'}
      id="try">
      <div className="productShowcaseSection paddingBottom">
        <h2 className={'tryItOut'}>{'Try it out!'}</h2>
        <MarkdownBlock>
          Check out the [demo
          project](https://github.com/JKHeadley/rest-hapi-demo) or click the
          button below to play with the live demo.
        </MarkdownBlock>
        {/* <p>Check out the live demo or </p> */}
        <a className="button" href="https://demo.resthapi.com">
          LIVE DEMO
        </a>
      </div>
    </Container>
  )
}

const Showcase = props => {
  if ((siteConfig.users || []).length === 0) {
    return null
  }
  const showcase = siteConfig.users
    .filter(user => {
      return user.pinned
    })
    .map((user, i) => {
      return (
        <a href={user.infoLink} key={i}>
          <img src={user.image} alt={user.caption} title={user.caption} />
        </a>
      )
    })

  return (
    <div className="productShowcaseSection paddingBottom">
      <h2>{"Who's Using rest-hapi?"}</h2>
      <p>rest-hapi is powering the APIs of these projects...</p>
      <div className="logos">{showcase}</div>
      <div className="more-users">
        <a className="button" href={pageUrl('users.html', props.language)}>
          More {siteConfig.title} Users
        </a>
      </div>
    </div>
  )
}

class Index extends React.Component {
  render() {
    let language = this.props.language || ''

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Features />
          <FeatureCallout />
          {/* <FeaturesList /> */}
          <Querying />
          <Validation />
          <Swagger />
          <TryOut />
          <Showcase language={language} />
        </div>
      </div>
    )
  }
}

module.exports = Index
