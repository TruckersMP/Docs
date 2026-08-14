<div align="center">
  <a href="https://truckersmp.com">
    <img src="static/img/truckersmp-logo.png" alt="TruckersMP" width="320">
  </a>
</div>

# TruckersMP Developer Docs

This repository holds the source of the TruckersMP developer documentation,
published at [docs.truckersmp.com](https://docs.truckersmp.com). The site is
built with [Docusaurus](https://docusaurus.io) and covers:

- **Client SDK**: guides and reference for building plugins for the TruckersMP
  game client.
- **Web API**: interactive reference rendered from the OpenAPI specification.

## Requirements

- [Node.js](https://nodejs.org) 18 or newer

## Installation

Install the dependencies:

```shell
npm install
```

## Development

Start a local server with live reload at `http://localhost:3000`:

```shell
npm run start
```

## Build

Create a production build in `build/` and preview it:

```shell
npm run build
npm run serve
```

## Layout

| Path | Content |
| --- | --- |
| `client-sdk/` | Client SDK guides and reference (Markdown) |
| `openapi/` | Web API OpenAPI specification |
| `src/` | Custom pages, components, and styling |
| `static/` | Images and other static assets |

## Support

If you have any questions about the documentation, you can create a topic in our
[Developer Portal](https://forum.truckersmp.com/index.php?/forum/198-developer-portal/)
on the official forum.

## License

Except as otherwise noted, the documentation and other content in this
repository is licensed under the Creative Commons Attribution-ShareAlike 4.0
International License (see [LICENSE](LICENSE)), and the site source and code
samples are licensed under the MIT License (see [LICENSE-CODE](LICENSE-CODE)).
