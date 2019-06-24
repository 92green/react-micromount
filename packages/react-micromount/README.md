# react-micromount

<a href="https://www.npmjs.com/package/react-micromount"><img src="https://img.shields.io/npm/v/react-micromount.svg?style=flat-square"></a>
[![CircleCI](https://circleci.com/gh/blueflag/react-micromount/tree/master.svg?style=shield)](https://circleci.com/gh/blueflag/react-micromount/tree/master)

React micromount is an experimental library that lets you mount React instances (or anything else) as though they are components. Unlike many other front end microservice libraries, react-micromount does not force you to microservice your code by routes, or enforce the use of iframes. It effectively allows you to create non-sandboxed micro-frontends.

It enables you to have different parts of the app running different versions of React with different dependencies, or even other Javascript frameworks inside React.
This may sound like a silver bullet, but please be aware that running micro-frontends like this [has a number of gotchas](#Gotchas).

## Packages

```bash
yarn add react-micromount
```

## API

### MicroMount

MicroMount is a React component. It accepts a URL of a micro-frontend to load, which must be a "mountable" object. The `MicroMount` component fetches it, and handles mounting and unmounting. In future it will also handle updates via props.

#### Props

- `url` is the URL of a micro-frontend (mountable) to mount
- `fallback` is rendered until the mountable is loaded
- `...additionalProps` are passed into the mountable

```js
import MicroMount from 'react-micromount';

<MicroMount
    url={process.env.MOUNTABLE_URL}
    fallback={"Loading..."}
    additionalProp={123}
/>
```

### Mountables

Mountables are the Javascript files that react-micromount can mount. They look like this:

```js
window["reactMicromounts"] = (window["reactMicromounts"] || []).push({
    mount: (container, props) => {
        // mount your micro-frontend
        // e.g. if you're using React...

        ReactDOM.render(<MyMicrofrontend {...props} />, container);
    },
    unmount: (container) => {
        // unmount your micro-frontend
        // e.g. if you're using React...

        ReactDOM.unmountComponentAtNode(container);
    }
});

```

- `container` is the DOM element to mount onto.
- `props` are the initial props passed to the component.

## Gotchas

In short:

- Be very careful to never make breaking changes to your APIs.
- Don't use globals or micro-frontends that add things to window.
- Don't pass any non-serialisable data into a micro-frontend (functions, classes etc.), unless you *really* know what you're doing.
- Don't expect code splitting on your micro-frontends to work if the micro-frontend's code is in a different parent URL to the rest of the app.
- Be aware of CSS rules and how they apply to the HTML produced by a micro-frontend.

### Globals

When micro-frontends create object on the window, these may clash when running two micro-frontends at once. They might be doing this without you knowing. For instance [did you know webpack creates a global to use with its code splitting / chunk loading?](https://github.com/webpack/docs/wiki/configuration#outputjsonpfunction)

### API surface area

All microservices and non-sandboxed micro-frontends must be **extremely** careful about never making breaking changes to their APIs. When using microservices you gain the ability to separate out build and deployments for parts of a system, but those parts of the system must remain compatible if they are to work together.
Non-sandboxed micro-frontends like the ones react-micromount allows can potentially have a *very* large surface area.

The app and its mountables must **always** agree on:
- The shape of their API used for mounting
 - In this case `window["reactMicromounts"] = ...` described above
- The shape of their API for passing data
  - In this case all props that are passed in, and if you're passing functions then all parameters and return values
  - Even the versions of special data structures and classes! In future react-micromount will only accept `JSON.stringify`-able data types by default as protection against these kinds of problems.
- The HTML structure and class names that are produced are also part of the API if you're applying CSS from the app onto the micro-frontend!
- Any globals that they use - but don't do this!

### Code splitting and chunk loading

Don't expect code splitting on your micro-frontends to work if the micro-frontend's code is in a different parent URL to the rest of the app. Non-sandboxed micro-frontends can't use code splitting or chunk loading if the chunk loader assumes that it's chunks are in the same location as the script doing the loading. Normally this is a very safe assumption to a chunk loader to make, and executing scripts in a different location than where they were designed to run goes against this assumption.

For example, the problem you may encounter is that a micro-frontend that uses code splitting with webpack will try to load additional chunks from the app's location rather than the location where the micro-service script came from (which is where the chunk really is).

### Cachebusting

Keep this in mind. You don't really want your users to have to download the same Javascipt file over and over, but you do want them to download the file if changes have occured. In future react-micromount should be able to hgelp with this.
