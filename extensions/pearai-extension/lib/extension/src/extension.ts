import * as vscode from "vscode";
import { AIClient } from "./ai/AIClient";
import { ApiKeyManager } from "./ai/ApiKeyManager";
import { ChatController } from "./chat/ChatController";
import { ChatModel } from "./chat/ChatModel";
import { ChatPanel } from "./chat/ChatPanel";
import { ConversationTypesProvider } from "./conversation/ConversationTypesProvider";
import { DiffEditorManager } from "./diff/DiffEditorManager";
import { indexRepository } from "./index/indexRepository";
import { getVSCodeLogLevel, LoggerUsingVSCodeOutput } from "./logger";
import { PEAR_AI_COMMAND_PREFIX } from "./utils/constants";

export const activate = async (context: vscode.ExtensionContext) => {
	const apiKeyManager = new ApiKeyManager({
		secretStorage: context.secrets,
	});

	const mainOutputChannel = vscode.window.createOutputChannel("PearAI");
	const indexOutputChannel = vscode.window.createOutputChannel("PearAI Index");

	const vscodeLogger = new LoggerUsingVSCodeOutput({
		outputChannel: mainOutputChannel,
		level: getVSCodeLogLevel(),
	});
	vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(`${PEAR_AI_COMMAND_PREFIX}.logger.level`)) {
			vscodeLogger.setLevel(getVSCodeLogLevel());
		}
	});

	const hasOpenAIApiKey = await apiKeyManager.hasOpenAIApiKey();
	const chatPanel = new ChatPanel({
		extensionUri: context.extensionUri,
		apiKeyManager,
		hasOpenAIApiKey,
	});

	const chatModel = new ChatModel();

	const conversationTypesProvider = new ConversationTypesProvider({
		extensionUri: context.extensionUri,
	});

	await conversationTypesProvider.loadConversationTypes();

	const ai = new AIClient({
		apiKeyManager,
		logger: vscodeLogger,
	});

	const chatController = new ChatController({
		chatPanel,
		chatModel,
		ai,
		diffEditorManager: new DiffEditorManager({
			extensionUri: context.extensionUri,
		}),
		getConversationType(id: string) {
			return conversationTypesProvider.getConversationType(id);
		},
		basicChatTemplateId: "chat-en",
	});

	chatPanel.onDidReceiveMessage(
		chatController.receivePanelMessage.bind(chatController)
	);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			`${PEAR_AI_COMMAND_PREFIX}.chat`,
			chatPanel
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.enterOpenAIApiKey`,
			apiKeyManager.enterOpenAIApiKey.bind(apiKeyManager)
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.clearOpenAIApiKey`,
			async () => {
				await apiKeyManager.clearOpenAIApiKey();
				vscode.window.showInformationMessage("OpenAI API key cleared.");
			}
		),

		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.startConversation`,
			(templateId) => chatController.createConversation(templateId)
		),

		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.diagnoseErrors`,
			() => {
				chatController.createConversation("diagnose-errors");
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.explainCode`,
			() => {
				chatController.createConversation("explain-code");
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.findBugs`,
			() => {
				chatController.createConversation("find-bugs");
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.generateCode`,
			() => {
				chatController.createConversation("generate-code");
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.generateUnitTest`,
			() => {
				chatController.createConversation("generate-unit-test");
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.startChat`,
			() => {
				chatController.createConversation("chat-en");
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.openChat`,
			() => {
				chatController.showLastSelectedConversationOrCreateNew();
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.editCode`,
			() => {
				chatController.createConversation("edit-code");
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.touchBar.startChat`,
			() => {
				chatController.createConversation("chat-en");
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.showChatPanel`,
			async () => {
				await chatController.showChatPanel();
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.getStarted`,
			async () => {
				await vscode.commands.executeCommand(
					"workbench.action.openWalkthrough",
					{
						category: `${PEAR_AI_COMMAND_PREFIX}.pearai-extension#pearai`,
					}
				);
			}
		),
		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.reloadTemplates`,
			async () => {
				await conversationTypesProvider.loadConversationTypes();
				vscode.window.showInformationMessage("PearAI templates reloaded.");
			}
		),

		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.showLogs`,
			() => {
				mainOutputChannel.show(true);
			}
		),

		vscode.commands.registerCommand(
			`${PEAR_AI_COMMAND_PREFIX}.indexRepository`,
			() => {
				indexRepository({
					ai: ai,
					outputChannel: indexOutputChannel,
				});
			}
		)
	);

	return Object.freeze({
		async registerTemplate({ template }: { template: string }) {
			conversationTypesProvider.registerExtensionTemplate({ template });
			await conversationTypesProvider.loadConversationTypes();
		},
	});
};

export const deactivate = async () => {
	// noop
};
