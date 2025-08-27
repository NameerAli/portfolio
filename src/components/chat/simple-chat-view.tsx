'use client';

import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import { UIMessage } from 'ai';
import { motion } from 'framer-motion';
import ChatMessageContent from './chat-message-content';
import ToolRenderer from './tool-renderer';

interface SimplifiedChatViewProps {
  message: UIMessage;
  isLoading: boolean;
  addToolResult?: (args: { 
    tool: string; 
    toolCallId: string; 
    output: unknown; 
  }) => Promise<void>;
}


const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// ✅ Type guard for tool parts with state
function isToolPartWithState(part: any): part is { type: string; state: string; [key: string]: any } {
  return part && 
         typeof part === 'object' && 
         'state' in part && 
         typeof part.state === 'string' &&
         part.type?.startsWith('tool-');
}

// ✅ Type guard for text parts
function isTextPart(part: any): part is { type: 'text'; text: string } {
  return part && part.type === 'text' && typeof part.text === 'string';
}

export function SimplifiedChatView({
  message,
  isLoading,
  addToolResult,
}: SimplifiedChatViewProps) {
  if (message.role !== 'assistant') return null;

  // ✅ Safely filter tool parts using type guard
  const toolParts = message.parts?.filter((part) => 
    isToolPartWithState(part) && part.state === 'output-available'
  ) || [];

  // ✅ Safely filter text parts
  const textParts = message.parts?.filter((part) => 
    isTextPart(part) && part.text.trim().length > 0
  ) || [];

  // Only display the first tool (if any)
  const currentTool = toolParts.length > 0 ? [toolParts[0]] : [];
  const hasTextContent = textParts.length > 0;
  const hasTools = currentTool.length > 0;

  console.log('currentTool', currentTool);
  console.log('message.parts', message.parts);

  return (
    <motion.div {...MOTION_CONFIG} className="flex h-full w-full flex-col px-4">
      <div className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto">
        {/* Tool invocation result - displayed at the top */}
        {hasTools && (
          <div className="mb-4 w-full">
            <ToolRenderer
              toolInvocations={currentTool}
              messageId={message.id || 'current-msg'}
            />
          </div>
        )}

        {/* Text content */}
        {hasTextContent && (
          <div className="w-full">
            <ChatBubble variant="received" className="w-full">
              <ChatBubbleMessage className="w-full">
                <ChatMessageContent
                  message={message}
                  isLast={true}
                  isLoading={isLoading}
                  addToolResult={addToolResult}
                  skipToolRendering={true}
                />
              </ChatBubbleMessage>
            </ChatBubble>
          </div>
        )}

        <div className="pb-4"></div>
      </div>
    </motion.div>
  );
}
