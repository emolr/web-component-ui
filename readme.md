# Web Component UI / $ WUI

## A CLI tool for compiling Web Components and generating documentation.

This is a build tool that enables the possibilities of building web components in any style you'd like, using [Typescript](https://www.typescriptlang.org/) and [SASS](http://www.sass-lang.com/) where the output is readable code in vanillaJS and example documentation.


## Why did i start this project? 

Because I love ideas behind web components, it has the prospect of being the way to build long lasting and maintainable UI, and with frameworks like skateJS, Polymer and StencilJS it's seems to be going really well for web components.

All frameworks adds a level of technical depth, and this can be worth it depending on the project, where `wui` is a compiler tool that leaves no other than the code you choose.

Also by not using any framework `wui` is a great companion for writing AMP style webcomponents that are built using semantic markup that won't need a nodeJS Server Side Renderer. This means that the components can be built for any type of website while being crawlable for search engine bots, but this is up to the way your write your components, this tool just compiles them.


## Getting started

The easiest is to use WUI as a global CLI tool.


### Install the CLI

```
$ git clone _THISREPO_
```

```
$ cd web-component-ui && npm install && npm link
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
│       └── readme.md
```

From the project root run:

```
$ wui
```

This will generate a dist folder like this:

```
project/
├── dist
│   ├── lib
│   │   ├── index.html // Demo file
│   │   ├── yourElement.js // A single js web component incl. prefixed css
│   │   └── readme.md // The original readme file
│   └── demo.html
│
├── youElement/
│   ├── yourElement.scss
│   ├── yourElement.ts
│   └── readme.md
```

### CLI options

`wui` comes with a set of handy options:

| Option      | Description                                                            |
|-------------|------------------------------------------------------------------------|
| -w, --watch | Watches the source directory for changes and recompiles affected files |
| -s, --serve | Serves documentation written in `/src/ELEMENT/readme.md`               |
| -p, --prod  | Build the lib without source map files.                                |

Using the command like this:

```
$ wui --watch --serve
```

Will automatically open the documentation and autoreload on changes in `/src/**/*`. This makes it into a sandbox environtment for developing the components standalone.

Known issues:
The demo index view is in a very early stage, so reloading causes it to reload to the project root readme.md. 
Right click on the component name in the demo navigation and open in new tab for a better developing experience.


### How to write documentation for a component

In a component folder eg. `/src/element/` add a readme.md file.

In `/src/element/readme.md` write a title `# my component` (this will be used as component title in demo navigation)

And write what you would like (in markdown).


#### Create a inline demo

To create a inline demo you need to modify the `/src/element/readme.md` file and add:

![alt text](http://res.cloudinary.com/histudios/image/upload/v1511939930/Screen_Shot_2017-11-29_at_08.18.24_qio7iy.png "inline demo snippet")

You can create as many inline demo's as you like in a single `readme.md` file.

You can essentially link to any file inside the `<template>` meaning that you can create complex demos with multiple components in the library or with scripts loaded from a cdn.


### Using sass for components

To inject sass / css into the component `<style></style>` tag, just add a comment where you would like the css to be placed like this and it will be compiled and prefixed to the 2 latest browser versions:

```
/* inject:custom-element.scss */
```

For example it would look like this in the component:

```
const template = `
    <style>
        /* inject:custom-element.scss */
    </style>
    ...
`
```

_The scss file path is relative to the `.ts` file being modified._


## Can you help?
Yes! The more people (and bots) the better.

Please create an issue, make a pull request, start a discussion or ping me on [twitter - @emolrmoeller](https://twitter.com/emilrmoeller).

## The future? 
I'm working especially on refining the build tools, make the code more readable and higher quality. 
I would also love to see a testing suite like [web-component-tester](https://github.com/Polymer/web-component-tester) being implemented.

The only requirement for the future is that the generated web component code is clean readable vanilla JS including css so they can live long and prosper, even after this project is obsolete.
