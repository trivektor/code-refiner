const vscode = require("vscode");
const keytar = require("keytar");
const OpenAI = require("openai");
const { get } = require("lodash");

const APP_NAME = "code-refiner";

let openai;

async function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: await getApiKey(),
    });
  }

  return openai;
}

function getApiKey() {
  return keytar.getPassword(APP_NAME, "OPENAI_KEY");
}

async function checkApiKey() {
  const storedApiKey = await getApiKey();

  if (!storedApiKey) {
    const apiKey = await vscode.window.showInputBox({
      prompt:
        "Enter your OpenAI API key. You can get your API key at https://platform.openai.com/account/api-keys",
      password: true, // hides the input, useful if you want to treat the API key as a password
      ignoreFocusOut: true,
    });

    if (apiKey) {
      await keytar.setPassword(APP_NAME, "OPENAI_KEY", apiKey);

      return true;
    }
  }

  return !!storedApiKey;
}

async function reviewCode() {
  const hasApiKey = await checkApiKey();

  if (!hasApiKey) return;

  const openai = await getOpenAI();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Act as a developer code reviewer. You will help me identify potential bugs in the following code, give important suggestions on improving the code quality and maintainability, and check if it adheres to coding standards and best practices:
    ${getSelectedText()}
  `,
      },
    ],
    model: "gpt-3.5-turbo",
  });
  const message = get(completion, "choices.0.message.content");

  const panel = vscode.window.createWebviewPanel(
    "codeAnalysis",
    "Code Analysis",
    vscode.ViewColumn.One
  );

  panel.webview.html = `<h1>Code Refiner: Review Code</h1><pre>${message}</pre>`;
}

function getSelectedText() {
  return vscode.window.activeTextEditor.document.getText(
    vscode.window.activeTextEditor.selection
  );
}

module.exports = {
  reviewCode,
};
