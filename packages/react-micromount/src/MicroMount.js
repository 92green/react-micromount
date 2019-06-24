// @flow
import type {Node as ReactNode} from 'react';

import React from 'react';
// $FlowFixMe
import {useEffect} from 'react';
// $FlowFixMe
import {useRef} from 'react';
// $FlowFixMe
import {useState} from 'react';

import loadJs from 'load-js';

type MicroMountObject = {
    id: string,
    mount: (container: Node, props: {[prop: string]: any}) => void,
    unmount: (container: Node) => void
};

type Props = {
    fallback: ReactNode,
    url: string
};

export default function MicroMount(props: Props): ReactNode {
    let {fallback, url, ...initialPropsToPassDown} = props;

    let [showLoadingState, setLoadingState] = useState(true);

    const containerRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        // make a global promise chain ensures that only one script is fetched at a time
        // so that we can identify the next micromount result as corresponding to this request

        // alternatively, if IE11 supported document.currentScript then micromount results could
        // identify themselves via an id on their script tags, but it doesnt and its not polyfillable

        // TODO split out so requests can be concurrent on non IE

        window["reactMicromountChain"] = (window["reactMicromountChain"] || Promise.resolve())
            .then(() => loadJs([url]))
            .then(() => {
                // collect result from window if it has been placed there
                // it wont be there if the script was loaded in a previous mount
                let result: ?MicroMountObject = (window["reactMicromounts"] || []).shift();

                // create and possibly update a global map of mount results by their urls
                window["reactMicromountMap"] = (window["reactMicromountMap"] || {});
                if(result) {
                    window["reactMicromountMap"][url] = result;
                }

                let mountObjectFromStore = window["reactMicromountMap"][url];
                if(mountObjectFromStore && isMounted) {
                    mountObjectFromStore.mount(containerRef.current, initialPropsToPassDown);
                }
            })
            .then(() => {
                // update the state of the component if its still mounted
                if(isMounted) {
                    setLoadingState(false);
                }
            });

        return () => {
            // unmount the mount object at the url that was received from props
            // at the time that the main useEffect callback was called
            let mountObjectFromStore = (window["reactMicromountMap"] || {})[url];
            if(mountObjectFromStore) {
                mountObjectFromStore.unmount(containerRef.current);
            }
            isMounted = false;
        };
    }, [url]);

    // TODO, call mountObject.update with prop changes if it exists

    return <div>
        <div ref={containerRef} data-testid="micromount-container" />
        {showLoadingState && fallback}
    </div>;
}
