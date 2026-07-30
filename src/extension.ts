import path from 'path';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const cirko_path = path.join(context.extensionPath, 'bin', 'cirko.exe');

	const disposable = vscode.commands.registerCommand('vscode-cirko.convertSelection', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor found.');
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showInformationMessage('No text selected.');
			return;
		}

		// we need to send the selected text to the stdin of the cirko.exe process and get the output from its stdout
		const { spawn } = require('child_process');
		const cirkoProcess = spawn(cirko_path, [], { shell: true });

		let output = '';
		cirkoProcess.stdout.on('data', (data: Buffer) => {
			output += data.toString();
		});

		cirkoProcess.stderr.on('data', (data: Buffer) => {
			vscode.window.showErrorMessage(`Error: ${data.toString()}`);
		});

		cirkoProcess.on('close', (code: number) => {
			if (code === 0) {
				editor.edit(editBuilder => {
					editBuilder.replace(selection, output);
				});
			} else {
				vscode.window.showErrorMessage(`cirko.exe exited with code ${code}`);
			}
		});

		cirkoProcess.stdin.write(selectedText);
		cirkoProcess.stdin.end();

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
