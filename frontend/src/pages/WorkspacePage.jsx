import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import ChatWindow from "../components/ChatWindow.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import LoadingState from "../components/LoadingState.jsx";
import Sidebar from "../components/Sidebar.jsx";
import KanbanBoard from "../components/KanbanBoard.jsx";
import WorkspaceMembersPanel from "../components/WorkspaceMembersPanel.jsx";
import Avatar from "../components/Avatar.jsx";
import {
  clearChannels,
  createChannel,
  fetchChannelsByWorkspace,
  setActiveChannel
} from "../features/channelSlice.js";
import { appendIncomingMessage, clearMessages, fetchMessagesByChannel } from "../features/messageSlice.js";
import { clearTasks, createTask, fetchTasksByWorkspace, updateTask } from "../features/taskSlice.js";
import {
  fetchWorkspaceById,
  fetchWorkspaces,
  inviteWorkspaceMember,
  setActiveWorkspace,
  fetchWorkspaceActivity
} from "../features/workspaceSlice.js";
import NotificationBell from "../components/NotificationBell.jsx";
import ActivityPanel from "../components/ActivityPanel.jsx";
import { useWorkspaceSocket } from "../hooks/useWorkspaceSocket.js";

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'tasks'
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const [messageText, setMessageText] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState({
    loading: false,
    error: null
  });
  const typingTimerRef = useRef(null);
  const workspaceState = useSelector((state) => state.workspace);
  const channelState = useSelector((state) => state.channel);
  const messageState = useSelector((state) => state.message);
  const taskState = useSelector((state) => state.task);
  const currentUser = useSelector((state) => state.auth.user);

  const workspace = workspaceState.activeWorkspace;
  const workspaces = workspaceState.items;
  const channels = channelState.items;
  const activeChannel = channelState.activeChannel;

  const fallbackChannel = channels[0] || null;
  const selectedChannel = activeChannel || fallbackChannel;

  const { sendMessage, sendTyping } = useWorkspaceSocket({
    enabled: Boolean(currentUser && workspace),
    channelId: selectedChannel?._id,
    onReceiveMessage: (message) => {
      if (message?.channelId?._id === selectedChannel?._id || message?.channelId === selectedChannel?._id) {
        dispatch(appendIncomingMessage(message));
      }
    }
  });

  useEffect(() => {
    dispatch(clearChannels());
    dispatch(clearMessages());
    dispatch(clearTasks());
    dispatch(fetchWorkspaceById(workspaceId)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        dispatch(setActiveWorkspace(result.payload));
        dispatch(fetchChannelsByWorkspace(workspaceId));
        dispatch(fetchTasksByWorkspace({ workspaceId }));
        dispatch(fetchWorkspaceActivity(workspaceId));
      }
    });
    dispatch(fetchWorkspaces());
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (!activeChannel && fallbackChannel) {
      dispatch(setActiveChannel(fallbackChannel));
    }
  }, [activeChannel, fallbackChannel, dispatch]);

  useEffect(() => {
    if (selectedChannel?._id) {
      dispatch(fetchMessagesByChannel({ channelId: selectedChannel._id }));
    }
  }, [selectedChannel, dispatch]);

  const handleSendMessage = async () => {
    if (!selectedChannel || !messageText.trim()) return;

    sendMessage(
      {
        channelId: selectedChannel._id,
        workspaceId,
        text: messageText.trim(),
        attachments: []
      },
      (response) => {
        if (response?.success) {
          setMessageText("");
        }
      }
    );
  };

  const handleSelectChannel = (channel) => {
    dispatch(setActiveChannel(channel));
    dispatch(clearMessages());
    setMessageText("");
  };

  const handleCreateChannel = async ({ name, description, type }) => {
    try {
      const createdChannel = await dispatch(
        createChannel({
          workspaceId,
          name: name.trim(),
          description: description.trim(),
          type
        })
      ).unwrap();

      dispatch(setActiveChannel(createdChannel));
      dispatch(clearMessages());
      setMessageText("");
    } catch (error) {
      throw error;
    }
  };

  const handleInviteMember = async ({ email, role }) => {
    setInviteFeedback({
      loading: true,
      error: null
    });

    try {
      await dispatch(
        inviteWorkspaceMember({
          workspaceId,
          email,
          role
        })
      ).unwrap();

      setInviteFeedback({
        loading: false,
        error: null
      });
    } catch (error) {
      setInviteFeedback({
        loading: false,
        error: error || "Failed to invite member"
      });
      throw error;
    }
  };

  const handleCreateTask = async ({ title, description, assigneeId }) => {
    await dispatch(
      createTask({
        workspaceId,
        channelId: selectedChannel?._id || null,
        title: title.trim(),
        description: description.trim(),
        assigneeId: assigneeId || null
      })
    ).unwrap();
  };
  const handleStatusChange = async (task, newStatus) => {
    if (!workspaceId) return;
    await dispatch(updateTask({ workspaceId, taskId: task._id, payload: { status: newStatus } }));
  };
  useEffect(() => {
    if (!selectedChannel?._id) {
      return undefined;
    }

    sendTyping({
      channelId: selectedChannel._id,
      isTyping: Boolean(messageText.trim())
    });

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      sendTyping({
        channelId: selectedChannel._id,
        isTyping: false
      });
    }, 900);

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      sendTyping({
        channelId: selectedChannel._id,
        isTyping: false
      });
    };
  }, [messageText, selectedChannel?._id, sendTyping]);

  const visibleTasks = taskState.items;

  if (workspaceState.status === "loading" && !workspace) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <LoadingState label="Loading workspace data..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 text-white relative flex flex-col gap-4">
      {/* Top Navigation / Header */}
      <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111725]/40 px-5 py-3 shadow-lg backdrop-blur-md animate-fade-in shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo / Back link */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-ink-300 transition hover:bg-white/10 hover:text-white"
            title="Back to Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-500 shadow-sm shadow-accent-500/50" />
              <h1 className="text-base font-bold text-white tracking-tight">{workspace?.name || "Workspace"}</h1>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-ink-400 mt-0.5">Workspace View</p>
          </div>
        </div>

        {/* View selector & Utility actions */}
        <div className="flex items-center gap-6">
          {/* Custom tabs */}
          <div className="flex bg-ink-950/60 p-1 rounded-xl border border-white/5 shadow-inner">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'chat'
                  ? 'bg-accent-500 text-white shadow-md shadow-accent-500/15'
                  : 'text-ink-300 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              Chat
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'tasks'
                  ? 'bg-accent-500 text-white shadow-md shadow-accent-500/15'
                  : 'text-ink-300 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-2.224-2.408-3.467-4.242-2.193L9 12zm0 0v.008H12V12zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tasks
            </button>
          </div>

          {/* User controls / Notifications */}
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <NotificationBell />
            <Avatar name={currentUser?.name} size="sm" isOnline={true} showStatus={true} />
          </div>
        </div>
      </header>

      {/* Main 3-Column Workspace Panel Grid */}
      <div className="grid flex-1 min-h-0 grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-[#111725]/30 shadow-2xl backdrop-blur-md lg:grid-cols-[280px_minmax(0,1fr)_360px] animate-fade-in">
        <Sidebar
          workspaces={workspaces.length > 0 ? workspaces : workspace ? [workspace] : []}
          channels={channels}
          activeWorkspaceId={workspace?._id}
          activeChannelId={selectedChannel?._id}
          onSelectWorkspace={(selectedWorkspace) => {
            dispatch(setActiveWorkspace(selectedWorkspace));
            navigate(`/workspaces/${selectedWorkspace._id}`);
          }}
          onSelectChannel={handleSelectChannel}
          onCreateChannel={handleCreateChannel}
          creatingChannel={channelState.status === "loading"}
          channelError={channelState.error}
        />

        {/* Middle main view */}
        <div className="flex min-h-0 flex-col gap-4 p-4 border-r border-white/10 bg-black/10">
          <ErrorBanner
            message={workspaceState.error || channelState.error || messageState.error || taskState.error}
          />
          {activeTab === 'chat' ? (
            <ChatWindow
              channel={selectedChannel}
              messages={messageState.items}
              onSendMessage={handleSendMessage}
              messageText={messageText}
              setMessageText={setMessageText}
              loading={messageState.status === "loading"}
              currentUser={currentUser}
            />
          ) : (
            <KanbanBoard
              tasks={visibleTasks}
              loading={taskState.status === "loading"}
              onCreateTask={handleCreateTask}
              onStatusChange={(task, newStatus) => handleStatusChange(task, newStatus)}
              error={taskState.error}
              members={workspace?.members || []}
            />
          )}
        </div>

        {/* Right sidebars panel */}
        <div className="flex min-h-0 flex-col gap-4 p-4 overflow-y-auto bg-black/[0.04]">
          <WorkspaceMembersPanel
            workspace={workspace}
            onInvite={handleInviteMember}
            loading={inviteFeedback.loading}
            error={inviteFeedback.error}
          />
          <ActivityPanel />
        </div>
      </div>
    </main>
  );
}
