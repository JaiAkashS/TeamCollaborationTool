import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { createSocketClient } from "../services/socketClient.js";
import { updateMessageInStore, deleteMessageInStore } from "../features/messageSlice.js";
import { appendIncomingNotification } from "../features/notificationSlice.js";
import { appendIncomingActivityLog } from "../features/workspaceSlice.js";

export const useWorkspaceSocket = ({ enabled, workspaceId, channelId, onReceiveMessage, onTyping }) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const previousChannelIdRef = useRef(null);
  const previousWorkspaceIdRef = useRef(null);
  const receiveMessageRef = useRef(onReceiveMessage);
  const typingRef = useRef(onTyping);

  useEffect(() => {
    receiveMessageRef.current = onReceiveMessage;
  }, [onReceiveMessage]);

  useEffect(() => {
    typingRef.current = onTyping;
  }, [onTyping]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const socket = createSocketClient();
    socketRef.current = socket;

    socket.on("connect", () => {
      if (workspaceId) {
        socket.emit("join_workspace", { workspaceId });
        previousWorkspaceIdRef.current = workspaceId;
      }
      if (channelId) {
        socket.emit("join_channel", { channelId });
        previousChannelIdRef.current = channelId;
      }
    });

    socket.on("receive_message", (message) => {
      receiveMessageRef.current?.(message);
    });

    socket.on("typing", (payload) => {
      typingRef.current?.(payload);
    });

    socket.on("message_updated", (message) => {
      dispatch(updateMessageInStore(message));
    });

    socket.on("message_deleted", ({ messageId }) => {
      dispatch(deleteMessageInStore({ messageId }));
    });

    socket.on("notification_received", (notification) => {
      dispatch(appendIncomingNotification(notification));
    });

    socket.on("activity_logged", (activity) => {
      dispatch(appendIncomingActivityLog(activity));
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, dispatch]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (workspaceId) {
      if (previousWorkspaceIdRef.current && previousWorkspaceIdRef.current !== workspaceId) {
        socket.emit("leave_workspace", { workspaceId: previousWorkspaceIdRef.current });
      }
      socket.emit("join_workspace", { workspaceId });
      previousWorkspaceIdRef.current = workspaceId;
    }
  }, [workspaceId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (channelId) {
      if (previousChannelIdRef.current && previousChannelIdRef.current !== channelId) {
        socket.emit("leave_channel", { channelId: previousChannelIdRef.current });
      }
      socket.emit("join_channel", { channelId });
      previousChannelIdRef.current = channelId;
    }
  }, [channelId]);

  const sendMessage = useCallback((payload, ack) => {
    socketRef.current?.emit("send_message", payload, ack);
  }, []);

  const sendTyping = useCallback((payload) => {
    socketRef.current?.emit("typing", payload);
  }, []);

  return {
    socket: socketRef.current,
    sendMessage,
    sendTyping
  };
};
