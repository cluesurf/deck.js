<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<h3 align='center'>@cluesurf/deck</h3>
<p align='center'>
  Language-Agnostic Package Manager in TypeScript*
</p>

<br/>
<br/>
<br/>

## Welcome

This is an _attempt_ at a language-agnostic package manager, written in
TypeScript for use on new or existing programming languages. Going to
get this to work for the language I'm working on,
[`base`](https://github.com/cluesurf/base) (framework) for
[`tree`](https://github.com/cluesurf/base) (language), but make it so it
isn't directly tied to it. Hopefully that will spark the imagination of
someone future self to build an even more generic language-agnostic
package mangaer, if this doesn't end up filling that niche.

## Installation

```
pnpm add @cluesurf/deck
yarn add @cluesurf/deck
npm i @cluesurf/deck
```

## Goals

- Download NPM hosted packages
- Clone GitHub repositories
- Download and unpack tarballs
- Verify integrity of packages

## Implementation Details

Much of the code was used from the PNPM codebase, whcih provided the
basis for figuring out how to build a good package manager.

## Inspiration

```tree
load /x
  find task prepublish

deck @foo/bar
  hook prepublish, call prepublish
```

## License

MIT

## ClueSurf

This is being developed by the folks at [ClueSurf](https://clue.surf), a
California-based project for helping humanity master information and
computation. ClueSurf started off in the winter of 2008 as a spark of an
idea, to forming a company 10 years later in the winter of 2018, to a
seed of a project just beginning its development phases. It is entirely
bootstrapped by working full time and running
[Etsy](https://etsy.com/shop/cluesurf) and
[Amazon](https://www.amazon.com/s?rh=p_27%3AMount+Build) shops. Also
find us on [Facebook](https://www.facebook.com/cluesurf),
[Twitter](https://twitter.com/cluesurf), and
[LinkedIn](https://www.linkedin.com/company/cluesurf). Check out our
other GitHub projects as well!
