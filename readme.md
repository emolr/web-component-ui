# Web Component UI / $ WUI

## A CLI tool for compiling Web Components and generating documentation.

This is a build tool that enables the possibilities of building web components in any style you'd like, using [Typescript](https://www.typescriptlang.org/) and [SASS](http://www.sass-lang.com/) where the output is readable code in vanillaJS, bundled, and modulized ready for tree-shaking when used in project having their own build system.

## Generates component documentation from markdown
This CLI includes a feature to build documentation from makrdown files located in component folders. It will automatically build an index page with a navigation and a single documentation page per component.

## Generates additional documentation
When building a UI library often it's a good idea to explain voice and tone, and design princibles etc...
Placing markdown files in a folder called `docs` will convert these files as well.

## Why did I start this project? 

Because I love the idea behind web components, it holds the prospect of being the way to build long lasting and maintainable UI, and with frameworks like skateJS, Polymer and StencilJS it's seems to be going really well for web components.

But all frameworks adds some level of technical depth, and while this can be worth it depending on the project, `wui` is only a compiler tool that leaves no other than the code you choose while providing a great developer experience with typescript and SASS, generate a living styleguide and at the same time let you use any frameworks you'd like or go all vanillaJS.

What I've learned is that there are no correct way to write web components. They can be shaped for the system they are meant for. A web component meant to be consumed in a pre-compiles JS system may work very differently from a component used in Drupal with no JS pre-compilation (JS-SSR).


## Getting started

The easiest would be to use WUI as a global CLI tool, but it can also be installed in the project and be run with npm `"build": "node node_modules/web-component-ui/bin/wui --compile"` as an example.


### Install the CLI

```
$ npm install -g web-component-ui
```

`wui` is now available globally.


### Use the CLI

In a project that looks like this:

```
project/
├── src/
│   └── yourElement
│       ├── yourElement.scss
│       ├── yourElement.ts
│       ├── package.json
│       └── readme.md
```

From the project root run:

```
$ wui --compile --documentation 
```
or 
```
$ wui -c -d
```

This will generate a dist folder like this:

```
project/
├── dist
│   ├── lib
│   │   └── yourElement
│   │       ├── yourElement.html // Demo file
│   │       ├── yourElement.js // unresolved es6
│   │       ├── yourElement.bundle.js // es2015 IIFE with resolved dependencies using roll-up
│   │       ├── yourElement.module.js // UMD module to use with module bundlers
│   │       ├── package.json // List component dependencies and point to yourElement.module.js as main.
│   │       └── readme.md // The original readme file
│   └── demo.html
│
├── youElement/
│   ├── yourElement.scss
│   ├── yourElement.ts
│   ├── package.json
│   └── readme.md
```

### CLI options

`wui` comes with a set of handy options:

| Option      | Description                                                            |
|-------------|------------------------------------------------------------------------|
| -w, --watch | Watches the source directory for changes and recompiles affected files |
| -s, --serve | Serves documentation written in `/src/ELEMENT/element.md` with browserSync |
| -d, --documentation  | Generates a living styleguide from the `.md` files |
| -c, --compile  | Compiles and outputs es6, bundle and module version from the ts files |

Using the command like this:

```
$ wui --watch --serve --compile --documentation
```

Will automatically open the documentation and autoreload on changes in `/src/**/*`. This makes it into a sandbox environtment for developing the components standalone.

NB!<br>
The demo index view is in a very early stage, so reloading causes it to reload to the project root readme.md so when working on a single component, right click on the component name in the demo navigation and open in new tab for a better developing experience.

### Using sass for components

To inject sass / css into the component `<style></style>` tag, just add a style decorator where you would like the css to be placed like this and it will be compiled and prefixed to the 2 latest browser versions.
It's important that it's inside a template literal string so it won't be confused with a javascript decorator.

```
@style('projectroot/src/path/to/component/component.scss')
```

For example it would look like this in the component:

```
const template = `
    <style>
        @style('src/myComponent/myComponent.scss')
    </style>
    ...
`
```

_The scss file path needs to be absolute from project root._

### Create a component library
Because roll-up is used in the background, just make any `.ts` file where you import all the components you would like to bundle a library and it will generate a bundle with all components as well and each component individually. 

For example a file called `src/myLib.ts`:
```
import './myComponent/myComponent'
import './myOtherComponent/myOtherComponent'
```

This will generate `dist/myLib.js` && `dist/myLib.bundle.js` &&  `dist/myLib.module.js` containing the collection of components.

### How to write documentation

#### For a component

In a component folder eg. `/src/element/` add a `.md` file. (The `.md` filename can be called what you would like).

In `/src/element/element.md` write a title `# my component` (this will be used as component title in demo navigation)

And write what you would like (in markdown).

##### Create a inline demo in the component Markdown file.

To create a inline demo you need to modify the `/src/element/element.md` file and add:

![alt text](http://res.cloudinary.com/histudios/image/upload/v1511939930/Screen_Shot_2017-11-29_at_08.18.24_qio7iy.png "inline demo snippet")

You can create as many inline demo's as you like in a single `.md` file.

You can link to any file inside the `<template>` meaning that you can create complex demos with multiple components in the library or with scripts loaded from a cdn.

!NB<br>
When linking to component files in the `.md` file, paths should be relative to the js file you'd like to load from it's position in the dist folder.

#### Additional documentation

Add any markdown files in a docs folder, and it will generate those pages as well.

## Can you help?

Yes! The more people (and bots) the better.

Please create an issue, make a pull request, start a discussion or ping me on [twitter - @emolrmoeller](https://twitter.com/emilrmoeller).

## The future? 

* Implement a testing suite like [web-component-tester](https://github.com/Polymer/web-component-tester).
* Make the documentation pages themable and add features reading from package.json. Like add a git link if git has been configured in a package.json file for example.
* Update style on documentation in general.
* Have tests on this codebase.

The only requirement for the features in the future is that the generated web component code is clean readable vanilla JS including css so they can live long and prosper.