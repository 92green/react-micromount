// @flow
import type {Node} from "react";

import React from "react";
import Helmet from "react-helmet";
import {Head} from 'dcme-style';

import "./index.scss";

type Props = {
    children: *
};

export default ({children}: Props): Node => <div>
    <Helmet
        title="React Micromount"
        meta={[
            {name: "description", content: "???"}
        ]}
    />
    <Head />
    {children}
</div>;
