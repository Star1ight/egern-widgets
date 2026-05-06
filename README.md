# egern-widgets

A collection of Egern widgets maintained in one repository.

## Widgets

- `widgets/ciii-codex-widget`: Ciii Codex usage dashboard widget

## Remote update model

Egern remote updates are driven by the module or script URL plus `update_interval`.

The normal flow is:

1. Edit a widget locally
2. Commit and push to GitHub
3. Egern refreshes the remote URL on the next update interval

## Current widget paths

- Widget script: `widgets/ciii-codex-widget/src/widget.js`
- Module file: `widgets/ciii-codex-widget/module.yaml`
