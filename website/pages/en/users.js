/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')
const Container = CompLibrary.Container

const siteConfig = require(process.cwd() + '/siteConfig.js')

class Users extends React.Component {
  render() {
    if ((siteConfig.users || []).length === 0) {
      return null
    }
    const editUrl =
      siteConfig.repoUrl + '/edit/master/website/data/users.js'
    const showcase = siteConfig.users.map((user, i) => {
      return (
        <a href={user.infoLink} key={i}>
          <img src={user.image} alt={user.caption} title={user.caption} />
        </a>
      )
    })

    return (
      <div className="mainContainer">
        <Container padding={['bottom', 'top']}>
          <div className="showcaseSection">
            <div className="prose">
              <h1>Who's Using rest-hapi?</h1>
              <p>rest-hapi is powering the APIs of these projects...</p>
            </div>
            <div className="logos">{showcase}</div>
            <div className="prose">
              <p>Is your project using rest-hapi?</p>
              <a href={editUrl} className="button">
                Add your logo
              </a>
            </div>
          </div>
        </Container>
      </div>
    )
  }
}

module.exports = Users
