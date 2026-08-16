import path from 'path';
import * as vscode from 'vscode';
import { spawn } from 'child_process';

// Pomoćna funkcija za asinhro pokretanje cirko.exe i slanje teksta na stdin
function processTextWithCirko(cirkoPath: string, input: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const process = spawn(cirkoPath, [], { shell: false });

        let output = '';
        let errorOutput = '';

        // setEncoding('utf8') spaja nedovršene UTF-8 bajtove na granicama bafera
        process.stdout.setEncoding('utf8');
        process.stderr.setEncoding('utf8');

        process.stdout.on('data', (chunk: string) => {
            output += chunk;
        });

        process.stderr.on('data', (chunk: string) => {
            errorOutput += chunk;
        });

        process.on('error', (err) => {
            reject(err);
        });

        process.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(errorOutput || `Proces je završio sa kodom ${code}`));
            }
        });

        process.stdin.write(input, 'utf8');
        process.stdin.end();
    });
}

export function activate(context: vscode.ExtensionContext) {
    const cirkoPath = path.join(context.extensionPath, 'bin', 'cirko.exe');

    const disposable = vscode.commands.registerCommand('vscode-cirko.convertSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Nema aktivnog editora.');
            return;
        }

        const selections = editor.selections.filter(s => !s.isEmpty);

        if (selections.length === 0) {
            vscode.window.showInformationMessage('Nema izabranog teksta.');
            return;
        }

        try {
            // Paralelno obrađujemo sve selekcije
            const results = await Promise.all(
                selections.map(async (selection) => {
                    const text = editor.document.getText(selection);
                    const convertedText = await processTextWithCirko(cirkoPath, text);
                    return { selection, convertedText };
                })
            );

            // Zamenjujemo selekcije u jednom atomskom edit bloku
            await editor.edit(editBuilder => {
                for (const { selection, convertedText } of results) {
                    editBuilder.replace(selection, convertedText);
                }
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Greška pri konverziji: ${error.message || error}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}