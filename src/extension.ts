import * as vscode from 'vscode';

// Creates a text decoration for region marker colors based on user settings
function createDecoration(): vscode.TextEditorDecorationType {
  const config = vscode.workspace.getConfiguration('regionFold');
  const color = config.get<string>('markerColor', 'green')!;
  return vscode.window.createTextEditorDecorationType({
    dark: { color },
    light: { color }
  });
}

// Applies color decoration to // region and // endregion lines
function updateDecorations(editor: vscode.TextEditor, decoration: vscode.TextEditorDecorationType) {
  const options: vscode.DecorationOptions[] = [];
  for (let i = 0; i < editor.document.lineCount; i++) {
    const line = editor.document.lineAt(i);
    const text = line.text.trim();
    if (text.startsWith('// region') || text.startsWith('// endregion')) {
      options.push({ range: line.range });
    }
  }
  editor.setDecorations(decoration, options);
}

export function activate(context: vscode.ExtensionContext) {
  let regionDecoration = createDecoration();

  // Register custom fold-up command to ensure immediate folding
  context.subscriptions.push(
    vscode.commands.registerCommand('regionFold.foldUp', (line: number) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const oldSelection = editor.selection;
      const position = new vscode.Position(line, 0);
      editor.selection = new vscode.Selection(position, position);
      vscode.commands.executeCommand('editor.fold', { levels: 1, direction: 'up' }).then(() => {
        editor.selection = oldSelection;
      });
    })
  );

  // Folding range provider
  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider({ scheme: 'file' }, {
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
    })
  );

  // CodeLens provider for clickable "Fold ↑"
  const codeLensProvider: vscode.CodeLensProvider = {
    provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken) {
      const lenses: vscode.CodeLens[] = [];
      const re = /^\/\/\s*endregion\b/gm;
      const text = document.getText();
      let match: RegExpExecArray | null;
      while ((match = re.exec(text))) {
        const pos = document.positionAt(match.index);
        const range = new vscode.Range(pos.line, 0, pos.line, 0);
        lenses.push(new vscode.CodeLens(range, {
          title: 'Fold ↑',
          command: 'regionFold.foldUp',
          arguments: [pos.line]
        }));
      }
      return lenses;
    }
  } as any;

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ scheme: 'file' }, codeLensProvider)
  );

  // Function to apply decorations
  const applyAll = () => {
    vscode.window.visibleTextEditors.forEach(editor => {
      updateDecorations(editor, regionDecoration);
    });
  };

  // Initial apply and on changes
  applyAll();
  context.subscriptions.push(vscode.window.onDidChangeVisibleTextEditors(applyAll));
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        updateDecorations(editor, regionDecoration);
      }
    })
  );

  // Update color on configuration changes
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