import * as vscode from 'vscode';

// Decoration type for region markers
const regionDecoration = vscode.window.createTextEditorDecorationType({
  color: 'green'
});

export function activate(context: vscode.ExtensionContext) {
  // Folding provider
  const provider: vscode.FoldingRangeProvider = {
    provideFoldingRanges(
      document: vscode.TextDocument,
      _ctx: vscode.FoldingContext,
      _token: vscode.CancellationToken
    ) {
      const ranges: vscode.FoldingRange[] = [];
      const stack: number[] = [];
      for (let i = 0; i < document.lineCount; i++) {
        const text = document.lineAt(i).text;
        if (/^\s*\/\/\s*region\b/.test(text)) {
          stack.push(i);
        } else if (/^\s*\/\/\s*endregion\b/.test(text)) {
          const start = stack.pop();
          if (start !== undefined && i > start) {
            ranges.push(
              new vscode.FoldingRange(start, i, vscode.FoldingRangeKind.Region)
            );
          }
        }
      }
      return ranges;
    }
  };

  // Register folding provider for all file-based documents
  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider({ scheme: 'file' }, provider)
  );

  // Function to update green highlighting
  const updateDecorations = (editor: vscode.TextEditor) => {
    if (!editor) {
      return;
    }
    const regEx = /^\s*\/\/\s*(?:region|endregion)\b.*$/gm;
    const text = editor.document.getText();
    const decorations: vscode.DecorationOptions[] = [];
    let match: RegExpExecArray | null;
    while ((match = regEx.exec(text))) {
      const startPos = editor.document.positionAt(match.index);
      const endPos = editor.document.positionAt(match.index + match[0].length);
      decorations.push({ range: new vscode.Range(startPos, endPos) });
    }
    editor.setDecorations(regionDecoration, decorations);
  };

  // Trigger highlighting on active editor and document changes
  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        updateDecorations(editor);
      }
    })
  );
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document
      ) {
        updateDecorations(vscode.window.activeTextEditor);
      }
    })
  );
}

export function deactivate() {
  // Clean up decorations
  regionDecoration.dispose();
}