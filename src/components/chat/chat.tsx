'use client';

import { useChat } from '@ai-sdk/react';
import { AnimatePresence, motion, easeOut } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import ChatMessageContent from '@/components/chat/chat-message-content';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import { ChatBubble, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble';
import WelcomeModal from '@/components/welcome-modal';
import { Info } from 'lucide-react';
import HelperBoost from './HelperBoost';
import { ChatRequestOptions } from 'ai';

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;
  return <>{children}</>;
};

interface AvatarProps {
  hasActiveTool: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTalking: boolean;
}

const Avatar = dynamic<AvatarProps>(
  () =>
    Promise.resolve(({ hasActiveTool, videoRef, isTalking }) => {
      const isIOS = () => {
        const ua = window.navigator.userAgent;
        const platform = window.navigator.platform;
        const maxTouchPoints = window.navigator.maxTouchPoints || 0;

        const isIOSUA = /iPad|iPhone|iPod/.test(ua);
        const isIOSPlatform = /iPad|iPhone|iPod/.test(platform);
        const isIPadOS = platform === 'MacIntel' && maxTouchPoints > 1;
        const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);

        return isIOSUA || isIOSPlatform || isIPadOS || isSafari;
      };

      return (
        <div
          className={`flex items-center justify-center rounded-full transition-all duration-300 ${
            hasActiveTool ? 'h-20 w-20' : 'h-28 w-28'
          }`}
        >
          <div
            className="relative cursor-pointer"
            onClick={() => (window.location.href = '/')}
          >
            {isIOS() ? (
              <img
                src="/landing-memojis.png"
                alt="iOS avatar"
                className="h-full w-full scale-[1.8] object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                className="h-full w-full scale-[1.8] object-contain"
                muted
                playsInline
                loop
              >
                <source src="/final_memojis.webm" type="video/webm" />
                <source src="/final_memojis_ios.mp4" type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      );
    }),
  { ssr: false },
);

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: easeOut, // ✅ Use imported easing function
  },
};


const Chat = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');

  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  const {
    messages,
    status,
    error,
    sendMessage,
    regenerate,
    stop,
    setMessages,
    addToolResult,
  } = useChat({
    onError: (err) => {
      setLoadingSubmit(false);
      setIsTalking(false);
      if (videoRef.current) videoRef.current.pause();
      console.error('Chat error:', err.message, err.cause);
      toast.error(`Error: ${err.message}`);
    },
  });

  // Create a handler for the bottombar
  const handleBottombarSubmit = async (input: string, options?: ChatRequestOptions) => {
    await sendMessage({ text: input }, options);
  };

  // derive messages
  const { currentAIMessage, latestUserMessage, hasActiveTool } = useMemo(() => {
    const latestAIIndex = messages.findLastIndex((m) => m.role === 'assistant');
    const latestUserIndex = messages.findLastIndex((m) => m.role === 'user');

    const result = {
      currentAIMessage: latestAIIndex !== -1 ? messages[latestAIIndex] : null,
      latestUserMessage: latestUserIndex !== -1 ? messages[latestUserIndex] : null,
      hasActiveTool: false,
    };

    if (result.currentAIMessage) {
      result.hasActiveTool =
        result.currentAIMessage.parts?.some(
          (p) => p.type === 'tool-invocation' && (p as any).state === 'result',
        ) || false;
    }

    if (latestAIIndex < latestUserIndex) {
      result.currentAIMessage = null;
    }

    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' &&
      m.parts?.some(
        (p) => p.type === 'tool-invocation' && (p as any).state !== 'result',
      ),
  );

  // helper for submitting a query
  const submitQuery = async (query: string) => {
    if (!query.trim() || isToolInProgress) return;
    setLoadingSubmit(true);
    await sendMessage({ text: query });
    setLoadingSubmit(false);
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (isTalking) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  }, [isTalking]);

  const handleStop = () => {
    stop();
    setLoadingSubmit(false);
    setIsTalking(false);
    if (videoRef.current) videoRef.current.pause();
  };

  const isEmptyState =
    !currentAIMessage && !latestUserMessage && !loadingSubmit;

  const headerHeight = hasActiveTool ? 100 : 180;

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Header */}
      <div className="absolute top-6 right-8 z-51 flex flex-col-reverse items-center justify-center gap-1 md:flex-row">
        <WelcomeModal
          trigger={
            <div className="hover:bg-accent cursor-pointer rounded-2xl px-3 py-1.5">
              <Info className="text-accent-foreground h-8" />
            </div>
          }
        />
      </div>

      <div
        className="fixed top-0 right-0 left-0 z-50"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
        }}
      >
        <div
          className={`transition-all duration-300 ease-in-out ${
            hasActiveTool ? 'pt-6 pb-0' : 'py-6'
          }`}
        >
          <div className="flex justify-center">
            <ClientOnly>
              <Avatar
                hasActiveTool={hasActiveTool}
                videoRef={videoRef}
                isTalking={isTalking}
              />
            </ClientOnly>
          </div>

          <AnimatePresence>
            {latestUserMessage && !currentAIMessage && (
              <motion.div {...MOTION_CONFIG} className="mx-auto flex max-w-3xl px-4">
                <ChatBubble variant="sent">
                  <ChatBubbleMessage>
                    <ChatMessageContent
                      message={latestUserMessage}
                      isLast={true}
                      isLoading={false}
                    />
                  </ChatBubbleMessage>
                </ChatBubble>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main chat content */}
      <div className="container mx-auto flex h-full max-w-3xl flex-col">
        <div
          className="flex-1 overflow-y-auto px-2"
          style={{ paddingTop: `${headerHeight}px` }}
        >
          <AnimatePresence mode="wait">
            {isEmptyState ? (
              <motion.div
                key="landing"
                className="flex min-h-full items-center justify-center"
                {...MOTION_CONFIG}
              >
                <ChatLanding submitQuery={submitQuery} />
              </motion.div>
            ) : currentAIMessage ? (
              <div className="pb-4">
                <SimplifiedChatView
                  message={currentAIMessage}
                  isLoading={status === 'streaming'}
                  addToolResult={addToolResult}
                />
              </div>
            ) : (
              loadingSubmit && (
                <motion.div
                  key="loading"
                  {...MOTION_CONFIG}
                  className="px-4 pt-18"
                >
                  <ChatBubble variant="received">
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="sticky bottom-0 bg-white px-2 pt-3 md:px-0 md:pb-4">
          <div className="relative flex flex-col items-center gap-3">
            <HelperBoost submitQuery={submitQuery} />
            {/* ✅ ChatBottombar with all required props */}
            <ChatBottombar
              onSubmit={handleBottombarSubmit}
              isLoading={status === 'streaming'}
              stop={handleStop}
              isToolInProgress={isToolInProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
