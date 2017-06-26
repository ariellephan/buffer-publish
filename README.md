# Buffer Publish

Previously Project Donut 🍩

[![Build Status](https://travis-ci.com/bufferapp/buffer-publish.svg?token=DihKVnja7EjA9uxoqNCQ&branch=master)](https://travis-ci.com/bufferapp/buffer-publish)

Buffer Publish

- [Quick Start](#quick-start)
- [NPM Commands](#npm-commands)
- [Adding New Dependencies](#adding-new-dependencies)
- [How Packages Communicate](#how-packages-communicate)

## Quick Start

Under normal development conditions you should be able to start `buffer-publish` using the `./dev up` command (currently on the `publish` branch).

If you need to start the server by itself:

```sh
npm run init
npm start
```

### Login/Logout

Currently the login service does not exist yet, however there are two methods exposed that trigger a login and logout

#### Login

Type this in the Javascript Console (with your credentials):

`clientId` and `clientSecret` are credentials from creating a Buffer app: https://local.buffer.com/developers/apps

You'll likely need to grab `clientSecret` directly from Mongo using `./dev mongo`.

```js
login({
  email: 'admin@bufferapp.com',
  password: 'password',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
});
```

#### Logout

Type this in the Javascript Console:

```js
logout();
```

## NPM Commands

### bootstrap

This runs `npm` install on each package and symlinks local packages.

### clean

Deletes all `node_modules` from all packages. Use this first if you see any odd dependency errors and then follow with `npm run bootstrap`;

### test

Runs `npm test` on all packages

### init

Runs `npm install` on the top level package and then runs `npm run bootstrap` to setup all packages.

### start

Start up the publish service (dev mode starts up webpack with hot module reloading).

### publish

**Coming Soon** This publishes the packages on NPM

### build

**Coming Soon** Use webpack to create a production build

## Adding New Dependencies

Adding packages to a `lerna` projects is slightly different than adding to a standard node package. Common `devDependencies` can be added to the top level `package.json` file. For more details on that: https://github.com/lerna/lerna#common-devdependencies

### Adding A Common Dependencies

This is the most likely scenario you'll face.

in the root directory (`buffer-publish/`) run the follwing commands:

```sh
npm run -SDE some-cool-package
npm run bootstrap
```

This makes `some-cool-package` available to all packages

### Creating A Dependency To Another Local Package

To create a dependency to the login package from the example package:

In the `example` package add the following entry in the `packages/example/package.json` file under the dependencies key:

```js
{
  //...other stuff...
  dependencies:{
    //...other dependencies...
    "@bufferapp/login": "0.0.1", // this version must be exact otherwise it fetches from npm
  }
}
```

**Important**

The version number must be exact to link local packages, otherwise it will (try to) fetch the package from NPM.


### Add A Dependency That Runs A Binary

An example of this would be `eslint` or `jest`. These should be added to the individual package:

```sh
cd packages/example/
npm run -SDE jest
```

## How Packages Communicate

At a high level each package communicates using the [Observer Pattern](https://en.wikipedia.org/wiki/Observer_pattern) through the Redux store. This means that each package receives all events and decides whether to modify their own state or ignore the event. An event (or action) flows from the originator to all other packages (including itself):


```
Package-A ---action--->Redux Store--->Package-B
  ^                             |
  |-----------------------------|---->Package-C
```

If you need to listen to another packages events, import the actionTypes into the package you're building:


```js
//reducer.js - in @bufferapp/example package
import { actionTypes, loginActionTypes } from '@bufferapp/login';

// handle login event
export default (state, action) => {
  switch (action.type) {
    case loginActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        loggedIn: true,
      };
    default:
      return state;
  }
};
```
