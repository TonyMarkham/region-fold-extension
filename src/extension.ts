import * as vscode from 'vscode';
import * as path from 'path';

// Creates a text decoration for region marker colors based on user settings
function createDecoration(): vscode.TextEditorDecorationType {
  const config = vscode.workspace.getConfiguration('regionFold');
  const color = config.get<string>('markerColor', 'green')!;
  return vscode.window.createTextEditorDecorationType({
    dark: { color },
    light: { color }
  });
}

// Creates a gutter icon decoration for endregion markers
function createFoldIconDecoration(context: vscode.ExtensionContext): vscode.TextEditorDecorationType {
  const iconPath = context.asAbsolutePath(path.join('resources', 'fold-up.svg'));
  return vscode.window.createTextEditorDecorationType({
    gutterIconPath: iconPath,
    gutterIconSize: 'contain'
  });
}

// Applies color decoration to // region and // endregion lines
function updateDecorations(editor: vscode.TextEditor, deco: vscode.TextEditorDecorationType) {
  const options: vscode.DecorationOptions[] = [];
  for (let i = 0; i < editor.document.lineCount; i++) {
    const line = editor.document.lineAt(i);
    const text = line.text.trim();
    if (text.startsWith('// region') || text.startsWith('// endregion')) {
      options.push({ range: line.range });
    }
  }
  editor.setDecorations(deco, options);
}

// Applies fold-up gutter icons to // endregion lines
function updateFoldIcons(editor: vscode.TextEditor, deco: vscode.TextEditorDecorationType) {
  const ranges: vscode.Range[] = [];
  for (let i = 0; i < editor.document.lineCount; i++) {
    const line = editor.document.lineAt(i);
    if (line.text.trim().startsWith('// endregion')) {
      ranges.push(line.range);
    }
  }
  editor.setDecorations(deco, ranges);
}

export function activate(context: vscode.ExtensionContext) {
  let regionDecoration = createDecoration();
  let foldIconDecoration = createFoldIconDecoration(context);

  // Folding Range Provider
  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider(
      { scheme: 'file' },
      {
        provideFoldingRanges(document: vscode.TextDocument) {
          const ranges: vscode.FoldingRange[] = [];
          const stack: number[] = [];
          for (let i = 0; i < document.lineCount; i++) {
            const text = document.lineAt(i).text;
            if (/^\s*\/\/\s*region\b/.test(text)) {
              stack.push(i);
            } else if (/^\s*\/\/\s*endregion\b/.test(text)) {
              const start = stack.pop();
              if (start !== undefined && i > start) {
                ranges.push(new vscode.FoldingRange(start, i, vscode.FoldingRangeKind.Region));
              }
            }
          }
          return ranges;
        }
      }
    )
  );

  // CodeLens Provider for clickable "Fold ↑" and cast to suppress TS overload errors
  const codeLensProvider = {
    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
      const lenses: vscode.CodeLens[] = [];
      const re = /^\/\/\s*endregion\b/gm;
      const text = document.getText();
      let match: RegExpExecArray | null;
      while ((match = re.exec(text))) {
        const pos = document.positionAt(match.index);
        const range = new vscode.Range(pos.line, 0, pos.line, 0);
        lenses.push(new vscode.CodeLens(range, {
          title: 'Fold ↑',
          command: 'editor.fold',
          arguments: [{ levels: 1, direction: 'up' }]
        }));
      }
      return lenses;
    }
  } as vscode.CodeLensProvider;

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ scheme: 'file' }, codeLensProvider)
  );

  // Helper to apply line decorations and fold icons
  const applyAll = () => {
    vscode.window.visibleTextEditors.forEach(editor => {
      updateDecorations(editor, regionDecoration);
      updateFoldIcons(editor, foldIconDecoration);
    });
  };

  applyAll();

  // Reapply on visible editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(applyAll)
  );

  // Reapply on document edits
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      vscode.window.visibleTextEditors.forEach(editor => {
        if (editor.document === event.document) {
          updateDecorations(editor, regionDecoration);
          updateFoldIcons(editor, foldIconDecoration);
        }
      });
    })
  );

  // Listen for color configuration changes and reapply decorations
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('regionFold.markerColor')) {
        regionDecoration.dispose();
        regionDecoration = createDecoration();
        applyAll();
      }
    })
  );
}

export function deactivate() {}