// @flow
import React from 'react';

import {DocsHeader} from 'dcme-style';
import {Link as HtmlLink} from 'dcme-style';
import {Text} from 'dcme-style';

import {Link} from 'dcme-gatsby';
import ContentNav from '../shape/ContentNav';
import Layout from '../layout/Layout';
import IndexMarkdown from './index.mdx';

export default () => <Layout>
    <DocsHeader
        title={() => <Text element="h1" modifier="sizeTera superDuper margin">react-micromount</Text>}
        description={() => "???"}
        links={() => <Text><HtmlLink href="https://github.com/blueflag/react-micromount">github</HtmlLink> | <HtmlLink href="https://www.npmjs.com/package/react-micromount">npm</HtmlLink> | <Link to="/api">api documentation</Link></Text>}
    />
    <ContentNav
        content={() => <IndexMarkdown />}
        pageNav={[]}
    />
</Layout>;
