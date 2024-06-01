export const PEAR_AI_COMMAND_PREFIX = "pearai";

export enum ChatActions {
	START_CHAT = "startChat",
	OPEN_CHAT = "openChat",
	ENTER_OPENAI_KEY = "enterOpenAIApiKey",
	CLICK_COLLAPSED_CONVERSATION = "clickCollapsedConversation",
	DELETE_CONVERSATION = "deleteConversation",
	EXPORT_CONVERSATION = "exportConversation",
	SEND_MESSAGE = "sendMessage",
	REPORT_ERROR = "reportError",
	DISMISS_ERROR = "dismissError",
	RETRY = "retry",
	APPLY_DIFF = "applyDiff",
	INSERT_PROMPT_INTO_EDITOR = "insertPromptIntoEditor",
}
