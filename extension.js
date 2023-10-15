const vscode = require("vscode");
const { reviewCode } = require("./commands");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "code-refiner.reviewCode",
    reviewCode
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
