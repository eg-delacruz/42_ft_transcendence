import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { useAuthContext } from "@/context/context";

type SocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

type SocketRole = "user" | "admin" | "super_admin";

export type ChatSocketUser = {
  userId: string;
  email: string;
  role: SocketRole;
};

export type ChatRoomInfo = {
  roomId: string;
  name: string;
  description?: string;
  createdAt: string;
  memberCount: number;
};

export type ChatMessage = {
  messageId: string;
  roomId: string;
  sender: ChatSocketUser;
  text: string;
  createdAt: string;
};

export type ChatEventLog = {
  event: string;
  timestamp: number;
  payload: unknown;
};

export type AckResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string | number;
  };
};

type CreateRoomPayload = {
  name: string;
  description?: string;
};

type JoinRoomPayload = {
  roomId: string;
};

type LeaveRoomPayload = {
  roomId: string;
};

type SendMessagePayload = {
  roomId: string;
  text: string;
};

type GetRoomMessagesPayload = {
  roomId: string;
  limit?: number;
  offset?: number;
};

const SOCKET_URL = "http://localhost:3000/chat";

function emitWithAck<TPayload, TResponse>(
  socket: Socket,
  eventName: string,
  payload: TPayload,
): Promise<AckResponse<TResponse>> {
  return new Promise((resolve) => {
    socket.emit(eventName, payload, (response: AckResponse<TResponse>) => {
      resolve(response);
    });
  });
}

export function useChatSocket() {
  const { user, loading } = useAuthContext();
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<ChatRoomInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<ChatEventLog[]>([]);
  const [lastCreatedRoom, setLastCreatedRoom] = useState<ChatRoomInfo | null>(
    null,
  );
  const [lastJoinedRoom, setLastJoinedRoom] = useState<ChatRoomInfo | null>(
    null,
  );

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  const pushEvent = (event: string, payload: unknown) => {
    setEvents((current) =>
      [{ event, timestamp: Date.now(), payload }, ...current].slice(0, 25),
    );
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setStatus("idle");
      setError(null);
      setActiveRoomId(null);
      setRooms([]);
      setMessages([]);
      setEvents([]);
      setLastCreatedRoom(null);
      setLastJoinedRoom(null);
      return;
    }

    if (!socketRef.current) {
      const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      socket.on("connect", async () => {
        setStatus("connected");
        setError(null);
        pushEvent("connect", { socketId: socket.id });
        // Cargar rooms al conectar
        try {
          const res = await emitWithAck<object, { rooms: ChatRoomInfo[] }>(
            socket,
            "get_rooms",
            {},
          );
          if (res.success && res.data?.rooms) setRooms(res.data.rooms);
        } catch {
          /* silencioso */
        }
      });

      socket.on("disconnect", (reason) => {
        setStatus("disconnected");
        pushEvent("disconnect", reason);
      });

      socket.on("reconnect_attempt", (attempt) => {
        setStatus("reconnecting");
        pushEvent("reconnect_attempt", { attempt });
      });

      socket.on("connect_error", (socketError: Error) => {
        setStatus("error");
        setError(socketError.message);
        pushEvent("connect_error", socketError.message);
      });

      socket.on("room:user_joined", (payload) => {
        pushEvent("room:user_joined", payload);
      });

      socket.on("room:user_left", (payload) => {
        pushEvent("room:user_left", payload);
      });

      socket.on("room:typing", (payload) => {
        pushEvent("room:typing", payload);
      });

      socket.on("room:stop_typing", (payload) => {
        pushEvent("room:stop_typing", payload);
      });

      socket.on("message:new", (payload: ChatMessage) => {
        setMessages((current) => [...current, payload]);
        pushEvent("message:new", payload);
      });

      socketRef.current = socket;
    }

    setStatus("connecting");
    socketRef.current.connect();

    return () => {
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setStatus("idle");
    };
  }, [isAuthenticated, loading]);

  const createRoom = async (payload: CreateRoomPayload) => {
    if (!socketRef.current) {
      throw new Error("Socket not connected");
    }
    console.log("Creating room with payload [name]:", payload);
    type RoomCreatedResponse = { room: ChatRoomInfo; timestamp: string };

    const response = await emitWithAck<CreateRoomPayload, RoomCreatedResponse>(
      socketRef.current,
      "create_room",
      payload,
    );
    pushEvent("create_room", response);
    console.log("Create room response:", response);
    // REVIEWQUE MIERDA PASA AQUI?

    if (response.success && response.data?.room) {
      setLastCreatedRoom(response.data.room);
      setRooms((current) => [
        response.data!.room,
        ...current.filter((room) => room.roomId !== response.data!.room.roomId),
      ]);
    }

    return response;
  };

  const getRoom = async (roomId: string) => {
    if (!socketRef.current) {
      throw new Error("Socket not connected");
    }

    const response = await emitWithAck<JoinRoomPayload, ChatRoomInfo>(
      socketRef.current,
      "get_room",
      { roomId },
    );
    pushEvent("get_room", response);

    if (response.success && response.data) {
      setRooms((current) => [
        response.data!,
        ...current.filter((room) => room.roomId !== response.data!.roomId),
      ]);
    }

    return response;
  };

  const getRoomMessages = async (payload: GetRoomMessagesPayload) => {
    if (!socketRef.current) {
      throw new Error("Socket not connected");
    }

    const response = await emitWithAck<
      GetRoomMessagesPayload,
      { roomId: string; messages: ChatMessage[]; total: number }
    >(socketRef.current, "get_room_messages", payload);
    pushEvent("get_room_messages", response);

    if (response.success && response.data?.messages) {
      setMessages(response.data.messages);
    }

    return response;
  };

  const joinRoom = async (payload: JoinRoomPayload) => {
    if (!socketRef.current) {
      throw new Error("Socket not connected");
    }

    const response = await emitWithAck<
      JoinRoomPayload,
      {
        roomId: string;
        userId: string;
        timestamp: string | number;
        room?: ChatRoomInfo;
      }
    >(socketRef.current, "join_room", payload);
    pushEvent("join_room", response);

    if (response.success && response.data?.room) {
      setActiveRoomId(response.data.roomId);
      setLastJoinedRoom(response.data.room);
      setRooms((current) => [
        response.data!.room!,
        ...current.filter(
          (room) => room.roomId !== response.data!.room!.roomId,
        ),
      ]);
    }

    return response;
  };

  const leaveRoom = async (payload: LeaveRoomPayload) => {
    if (!socketRef.current) {
      throw new Error("Socket not connected");
    }

    const response = await emitWithAck<
      LeaveRoomPayload,
      { roomId: string; userId: string; timestamp: string | number }
    >(socketRef.current, "leave_room", payload);
    pushEvent("leave_room", response);

    if (response.success && activeRoomId === payload.roomId) {
      setActiveRoomId(null);
    }

    return response;
  };

  const sendMessage = async (payload: SendMessagePayload) => {
    if (!socketRef.current) {
      throw new Error("Socket not connected");
    }

    const response = await emitWithAck<SendMessagePayload, ChatMessage>(
      socketRef.current,
      "send_message",
      payload,
    );
    pushEvent("send_message", response);

    return response;
  };

  const typing = (roomId: string) => {
    socketRef.current?.emit("typing", roomId);
    pushEvent("typing", { roomId });
  };

  const stopTyping = (roomId: string) => {
    socketRef.current?.emit("stop_typing", roomId);
    pushEvent("stop_typing", { roomId });
  };

  const clearMessages = () => {
    setMessages([]);
    pushEvent("clear_messages", {});
  };

  return {
    socket: socketRef.current,
    status,
    error,
    isAuthenticated,
    activeRoomId,
    rooms,
    messages,
    events,
    lastCreatedRoom,
    lastJoinedRoom,
    createRoom,
    getRoom,
    getRoomMessages,
    joinRoom,
    leaveRoom,
    sendMessage,
    typing,
    stopTyping,
    clearMessages,
  };
}
