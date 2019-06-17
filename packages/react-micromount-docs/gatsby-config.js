// @flow
const {gatsbyConfig} = require('dcme-gatsby/lib/gatsby/gatsby-config');

module.exports = {
    pathPrefix: '/react-micromount',
    siteMetadata: {
        title: 'React Micromount'
    },
    ...gatsbyConfig
};
