/// <reference types="vscode" />

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration();
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders) {
        const rootPath = workspaceFolders[0].uri.fsPath;
        const targetName = config.get<string>('copilotInstructions.targetName', 'copilot-instructions.md');
        const targetPath = path.join(rootPath, targetName);
        const sourcePath = config.get<string>('copilotInstructions.sourcePath');

        // Check if the target file exists when opening the workspace
        if (!fs.existsSync(targetPath)) {
            vscode.window.showInformationMessage(`${targetName} is missing. Do you want to create it?`, 'Yes', 'No').then(selection => {
                if (selection === 'Yes' && sourcePath && fs.existsSync(sourcePath)) {
                    try {
                        fs.copyFileSync(sourcePath, targetPath);
                        vscode.window.showInformationMessage(`${targetName} has been created.`);
                    } catch (err) {
                        vscode.window.showErrorMessage(`Failed to create ${targetName}: ${err}`);
                    }
                }
            });
        }

        // Watch for changes in the source file
        if (sourcePath && fs.existsSync(sourcePath)) {
            const sourceWatcher = fs.watch(sourcePath, (eventType) => {
                if (eventType === 'change') {
                    const sourceStat = fs.statSync(sourcePath);
                    const targetStat = fs.existsSync(targetPath) ? fs.statSync(targetPath) : null;

                    if (!targetStat || sourceStat.mtime > targetStat.mtime) {
                        vscode.window.showInformationMessage(`${targetName} is outdated. Do you want to replace it with the updated version?`, 'Yes', 'No').then(selection => {
                            if (selection === 'Yes') {
                                try {
                                    fs.copyFileSync(sourcePath, targetPath);
                                    vscode.window.showInformationMessage(`${targetName} has been updated.`);
                                } catch (err) {
                                    vscode.window.showErrorMessage(`Failed to update ${targetName}: ${err}`);
                                }
                            }
                        });
                    }
                }
            });

            context.subscriptions.push({ dispose: () => sourceWatcher.close() });
        }
    }

    // Register existing commands
    const disposable = vscode.commands.registerCommand('copilot.addInstructions', () => {
        const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('No workspace folder open.');
            return;
        }

        const targetName = config.get<string>('copilotInstructions.targetName', 'copilot-instructions.md');
        const targetPath = path.join(rootPath, targetName);
        if (fs.existsSync(targetPath)) {
            vscode.window.showInformationMessage(`${targetName} already exists.`);
            return;
        }

        const sourcePath = config.get<string>('copilotInstructions.sourcePath');
        if (sourcePath && fs.existsSync(sourcePath)) {
            try {
                fs.copyFileSync(sourcePath, targetPath);
                vscode.window.showInformationMessage(`${targetName} has been added!`);
            } catch (err) {
                vscode.window.showErrorMessage(`Error: ${err}`);
            }
        } else {
            vscode.window.showErrorMessage('No valid source path for copilot-instructions.md is configured.');
        }
    });

    const setPathCommand = vscode.commands.registerCommand('copilot.setInstructionsPath', async () => {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: { Markdown: ['md'] },
            openLabel: 'Select copilot-instructions.md file'
        });

        if (fileUri && fileUri.length > 0) {
            await config.update('copilotInstructions.sourcePath', fileUri[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Copilot instructions file path saved!');
        }
    });

    const browseSourcePathCommand = vscode.commands.registerCommand('copilot.browseSourcePath', async () => {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: { Markdown: ['md'] },
            openLabel: 'Select copilot-instructions.md file'
        });

        if (fileUri && fileUri.length > 0) {
            await config.update('copilotInstructions.sourcePath', fileUri[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Copilot instructions file path updated!');
        }
    });

    context.subscriptions.push(disposable, setPathCommand, browseSourcePathCommand);
}

export function deactivate() {}
