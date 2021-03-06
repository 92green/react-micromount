// @flow
import React from 'react';
import {NavigationList} from 'dcme-style';
import {NavigationListItem} from 'dcme-style';
import {ContentNav} from 'dcme-style';
import {Link} from 'dcme-gatsby';

const nav = () => <NavigationList>
    <NavigationListItem><Link to="/">React Micromount</Link></NavigationListItem>
</NavigationList>;

export default (props) => <ContentNav nav={nav} {...props} />
