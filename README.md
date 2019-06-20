# Pinterested Keyword Tool
Pinterested Keyword Tool (PKT) is a keyword research tool for Pinterest.

PKT is built with `Node.js` and `Express` using Puppeteer on the server side and `Vue.js` on the frontend.

## Requirements
Node.JS - 12.x
npm / Yarn

## Installation
`yarn install`
or
`npm install`
## Development
`yarn dev` or `npm run dev`

Or you can manually run `node ./index.js/` and `parcel ./client/index.html`
## Approach

The tool uses Ajax calls made from Puppeteer with initialized Pinterest session.

Another type of requests are Ajax calls made from outside of Puppeteer to internal Pinterest API endpoints