/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

class Demo extends React.Component {
  render() {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.location.href = "http://ec2-54-187-254-62.us-west-2.compute.amazonaws.com";
        `
        }}
      />
    )
  }
}

module.exports = Demo
