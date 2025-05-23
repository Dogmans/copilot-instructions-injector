# Copilot Instructions Injector

## Overview
The Copilot Instructions Injector is a Visual Studio Code extension designed to streamline the process of adding a default `copilot-instructions.md` file to your workspace. This file is based on a user-selected template and can be customized to suit your needs.

## Features
- Automatically injects a `copilot-instructions.md` file into your workspace.
- Allows users to browse and select a source template file.
- Configurable target file name for flexibility.
- Simple and intuitive commands to manage instructions.

## Commands
- **Copilot: Add Instructions File**
  - Injects the `copilot-instructions.md` file into the workspace.
- **Copilot: Set Instructions File**
  - Allows you to set the path to the source template file.
- **Copilot: Browse Source Path**
  - Opens a file picker to select the source template file.

## Settings
- `copilotInstructions.sourcePath`
  - Path to the default `copilot-instructions.md` file to copy into new workspaces.
- `copilotInstructions.targetName`
  - The name of the target file to copy the instructions to (default: `copilot-instructions.md`).

## Installation
1. Download the `.vsix` file from the release page.
2. Open Visual Studio Code.
3. Go to the Extensions view (`Ctrl+Shift+X`).
4. Click on the `...` menu in the top-right corner and select `Install from VSIX...`.
5. Select the downloaded `.vsix` file to install the extension.

## Usage
1. Configure the source path and target name in the extension settings.
2. Use the commands from the Command Palette (`Ctrl+Shift+P`) to manage the instructions file.

## License
This extension is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Icon
The extension icon represents a syringe injecting instructions, symbolizing the functionality of the extension.
