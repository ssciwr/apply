# SSC Job Application Form proof-of-concept

[ssciwr.github.io/apply](https://ssciwr.github.io/apply)

WIP!

Proof of concept where you can upload multiple pdf files, fill in other data, then download a single merged pdf.

## Local development

Initial setup to edit the website locally:

- install [pnpm](https://pnpm.io/installation), e.g. `curl -fsSL https://get.pnpm.io/install.sh | sh -`
- install node dependencies, e.g. `pnpm install`
- install playwright browsers for testing: `pnpm exec playwright install --with-deps`

To start a dev server:

- `pnpm dev`

To run the tests locally and see them rendered in a browser:

- `pnpm test:ui`

To run the headless version of tests as done in CI:

- `pnpm test`
