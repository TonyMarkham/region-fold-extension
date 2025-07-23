# Region Fold

**Region Fold** is a Visual Studio Code extension that provides:

* **Code folding** for custom region markers (`// region` / `// endregion`) in any file.
* **Green syntax highlighting** on the marker lines to make regions easy to spot at a glance.

---

## Features

* Fold and unfold any block wrapped between `// region` and `// endregion` using the gutter icons or built‑in VS Code commands.
* Highlights both `// region` and `// endregion` lines in green for better visibility.
* Works in **all** file types (no language-specific configuration needed).

## Requirements

* Visual Studio Code **1.50.0** or later.
* No additional dependencies.

## Installation

1. From the **Extensions** view (`Ctrl+Shift+X` / `⌘+Shift+X`), search for **Region Fold** and install.
2. Or install from a VSIX file:

   ```bash
   code --install-extension region-fold-extension-0.0.2.vsix
   ```

## Usage

1. Insert custom region comments in your code:

   ```js
   // region My Section
   // ... your code here ...
   // endregion
   ```
2. Click the folding arrow in the gutter next to `// region` to collapse or expand the block.
3. You can also use commands:

   * **Fold**: `Ctrl+Shift+[` / `⌘+Option+[`
   * **Unfold**: `Ctrl+Shift+]` / `⌘+Option+]`
   * **Fold All**: `Ctrl+K Ctrl+0`
   * **Unfold All**: `Ctrl+K Ctrl+J`

## Extension Settings

This release has no custom settings yet, but future versions may allow you to configure:

* Marker keywords (e.g. `# region` / `# endregion`)
* Highlight color

## Contributing

1. Fork the repository.
2. Clone your fork and run:

   ```bash
   npm install
   npm run compile
   ```
3. Make your changes in `src/extension.ts`.
4. Run the extension in VS Code via the **Run Extension** debug profile.
5. Submit a pull request.

## License

MIT © Your Name
