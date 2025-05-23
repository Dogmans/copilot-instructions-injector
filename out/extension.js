"use strict";
/// <reference types="vscode" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function activate(context) {
    const config = vscode.workspace.getConfiguration();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const rootPath = workspaceFolders[0].uri.fsPath;
        const targetName = config.get('copilotInstructions.targetName', 'copilot-instructions.md');
        const targetFolder = path.join(rootPath, '.github');
        const targetPath = path.join(targetFolder, targetName);
        const sourcePath = config.get('copilotInstructions.sourcePath');
        // Ensure targetFolder exists
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }
        // Check if the target file exists when opening the workspace
        if (!fs.existsSync(targetPath)) {
            if (!sourcePath) {
                vscode.window.showInformationMessage('Source path is not set. Do you want to select a source file?', 'Yes', 'No').then(async (selection) => {
                    if (selection === 'Yes') {
                        const fileUri = await vscode.window.showOpenDialog({
                            canSelectMany: false,
                            filters: { Markdown: ['md'] },
                            openLabel: 'Select copilot-instructions.md file'
                        });
                        if (fileUri && fileUri.length > 0) {
                            await config.update('copilotInstructions.sourcePath', fileUri[0].fsPath, vscode.ConfigurationTarget.Global);
                            vscode.window.showInformationMessage('Source path updated!');
                            // Proceed to copy the file after setting the source path
                            if (fs.existsSync(fileUri[0].fsPath)) {
                                try {
                                    fs.copyFileSync(fileUri[0].fsPath, targetPath);
                                    vscode.window.showInformationMessage(`${targetName} has been created.`);
                                }
                                catch (err) {
                                    vscode.window.showErrorMessage(`Failed to create ${targetName}: ${err}`);
                                }
                            }
                            else {
                                vscode.window.showErrorMessage('Selected source file does not exist.');
                            }
                        }
                        else {
                            vscode.window.showWarningMessage('No file selected.');
                        }
                    }
                });
            }
            else {
                vscode.window.showInformationMessage(`${targetName} is missing. Do you want to create it?`, 'Yes', 'No').then(selection => {
                    if (selection === 'Yes' && fs.existsSync(sourcePath)) {
                        try {
                            fs.copyFileSync(sourcePath, targetPath);
                            vscode.window.showInformationMessage(`${targetName} has been created.`);
                        }
                        catch (err) {
                            vscode.window.showErrorMessage(`Failed to create ${targetName}: ${err}`);
                        }
                    }
                });
            }
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
                                }
                                catch (err) {
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
        const targetName = config.get('copilotInstructions.targetName', 'copilot-instructions.md');
        const targetFolder = path.join(rootPath, '.github');
        const targetPath = path.join(targetFolder, targetName);
        if (fs.existsSync(targetPath)) {
            vscode.window.showInformationMessage(`${targetName} already exists.`);
            return;
        }
        const sourcePath = config.get('copilotInstructions.sourcePath');
        if (sourcePath && fs.existsSync(sourcePath)) {
            try {
                fs.copyFileSync(sourcePath, targetPath);
                vscode.window.showInformationMessage(`${targetName} has been added!`);
            }
            catch (err) {
                vscode.window.showErrorMessage(`Error: ${err}`);
            }
        }
        else {
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
    const setSourcePathWithDialogCommand = vscode.commands.registerCommand('copilot.setSourcePathWithDialog', async () => {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: { Markdown: ['md'] },
            openLabel: 'Select copilot-instructions.md file'
        });
        if (fileUri && fileUri.length > 0) {
            const config = vscode.workspace.getConfiguration();
            await config.update('copilotInstructions.sourcePath', fileUri[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Copilot instructions source path updated!');
        }
        else {
            vscode.window.showWarningMessage('No file selected.');
        }
    });
    context.subscriptions.push(disposable, setPathCommand, browseSourcePathCommand, setSourcePathWithDialogCommand);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map