# Ciii Codex Egern Widget

Egern widget script for monitoring Ciii Codex usage.

## Files

- `src/widget.js`: the production widget script
- `module.yaml`: Egern module file for remote installation
- `tests/widget.test.mjs`: local regression tests for the widget DSL and aggregation logic

## How remote updates work

Egern does not watch your local git repo.

The update flow is:

1. Edit the widget locally
2. Commit and push to GitHub
3. Egern re-downloads the remote script/module URL after `update_interval`

## Publish to GitHub

After the repository is pushed, use these raw GitHub URLs:

```text
https://raw.githubusercontent.com/Star1ight/egern-widgets/main/widgets/ciii-codex-widget/src/widget.js
```

And the module file itself:

```text
https://raw.githubusercontent.com/Star1ight/egern-widgets/main/widgets/ciii-codex-widget/module.yaml
```

## Egern usage

Add the remote module in Egern:

1. `Tools -> Modules -> +`
2. Paste the raw `module.yaml` URL
3. Fill in `API_KEY` on the module settings page
4. Add the widget from `Analytics -> Widget Gallery`

## Local verification

```bash
node --test widgets/ciii-codex-widget/tests/widget.test.mjs
```
