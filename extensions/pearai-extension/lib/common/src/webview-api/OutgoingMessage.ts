import zod from "zod";
import { errorSchema } from "./ErrorSchema";
import { ChatActions } from "../../../extension/src/utils/constants";

export const outgoingMessageSchema = zod.discriminatedUnion("type", [
	zod.object({
		type: zod.literal(ChatActions.START_CHAT),
	}),
	zod.object({
		type: zod.literal(ChatActions.OPEN_CHAT),
	}),
	zod.object({
		type: zod.literal(ChatActions.ENTER_OPENAI_KEY),
	}),
	zod.object({
		type: zod.literal(ChatActions.CLICK_COLLAPSED_CONVERSATION),
		data: zod.object({
			id: zod.string(),
		}),
	}),
	zod.object({
		type: zod.literal(ChatActions.DELETE_CONVERSATION),
		data: zod.object({
			id: zod.string(),
		}),
	}),
	zod.object({
		type: zod.literal(ChatActions.EXPORT_CONVERSATION),
		data: zod.object({
			id: zod.string(),
		}),
	}),
	zod.object({
		type: zod.literal(ChatActions.SEND_MESSAGE),
		data: zod.object({
			id: zod.string(),
			message: zod.string(),
		}),
	}),
	zod.object({
		type: zod.literal(ChatActions.REPORT_ERROR),
		error: errorSchema,
	}),
	zod.object({
		type: zod.literal(ChatActions.DISMISS_ERROR),
		data: zod.object({
			id: zod.string(),
		}),
	}),
	zod.object({
		type: zod.literal(ChatActions.RETRY),
		data: zod.object({
			id: zod.string(),
		}),
	}),
	zod.object({
		type: zod.literal(ChatActions.APPLY_DIFF),
	}),
	zod.object({
		type: zod.literal(ChatActions.INSERT_PROMPT_INTO_EDITOR),
		data: zod.object({
			id: zod.string(),
		}),
	}),
]);

/**
 * A message sent from the webview to the extension.
 */
export type OutgoingMessage = zod.infer<typeof outgoingMessageSchema>;
