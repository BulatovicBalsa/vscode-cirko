# vscode-cirko README

vscode-cirko is a VS Code extension for converting selected text with the bundled Cirko CLI. It is designed for quick Latin-to-Cyrillic conversion directly in the editor.

## Features

* Converts the currently selected text in the active editor.
* Uses the bundled `bin/cirko.exe` executable to perform the conversion.
* Available from the editor context menu, the command palette, and the `F6` keybinding.
* Replaces the selection with the converted output.

## Requirements

* Windows, because the extension ships with `bin/cirko.exe`.
* An active text editor with a non-empty selection.

No additional configuration is required.

## Extension Settings

This extension does not contribute any settings yet.

## Known Issues

* The extension only runs on Windows, since the included converter binary is `cirko.exe`.
* If the converter exits with an error, the selection is left unchanged and VS Code shows the error message.

## Release Notes

### 0.0.1

Initial release of vscode-cirko.
