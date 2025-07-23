# Region Fold

![Version](https://img.shields.io/badge/version-0.0.3-green) ![VSCode](https://img.shields.io/badge/VS%20Code-%5E1.50.0-blue)

**Region Fold** enables custom code region folding and highlighting in **any** file type.

---

## Features

- 📑 **Custom Folding**: Collapse or expand any block wrapped between `// region` and `// endregion`.
- 🎨 **Configurable Highlighting**: Lines with region markers are highlighted (default: green).
- ⬆️ **Fold ↑ Command**: A **CodeLens** appears above each `// endregion` for one-click folding.

---

## Installation

1. Open the **Extensions** panel (`Ctrl+Shift+X` / `⌘+Shift+X`).
2. Search for **Region Fold** and click **Install**.

Or install manually:

```bash
npm install -g vsce
vsce package
code --install-extension region-fold-extension-0.0.3.vsix
```

---

## Usage

1. Add region markers in your code:
   ```js
   // region MySection
   // ... code ...
   // endregion
   ```
2. Click the folding arrow (▾/▸) beside `// region` or the **Fold ↑** link above `// endregion`.
3. Use keyboard shortcuts:
   - **Fold**: `Ctrl+Shift+[` / `⌘+Option+[`
   - **Unfold**: `Ctrl+Shift+]` / `⌘+Option+]`
   - **Fold All**: `Ctrl+K Ctrl+0`
   - **Unfold All**: `Ctrl+K Ctrl+J`

---

## Configuration

Customize in **Settings** (`Ctrl+,` / `⌘+,`) under **Extensions → Region Fold**:

| Setting                  | Type   | Default | Description                            |
|--------------------------|--------|---------|----------------------------------------|
| `regionFold.markerColor` | string | `green` | CSS color for region marker highlighting |

---

## Commands

Run via **Command Palette** (`Ctrl+Shift+P` / `⌘+Shift+P`):

- **Region Fold: Fold Up Region** (`regionFold.foldUp`) — instantly collapse the surrounding region.

---

## Contributing

1. Fork and clone: `git clone https://github.com/your-name/region-fold-extension.git`
2. Install: `npm install`
3. Compile: `npm run compile`
4. Launch in VS Code: press **F5** to start the Extension Development Host.
5. Submit a pull request.

---

## License

MIT © Your Name

*Happy folding!*