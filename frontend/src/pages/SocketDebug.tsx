import { useState } from "react";

import { useEffect, useRef} from "react";
import { useAuthContext } from "@/context/context";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useSocket } from "@/hooks/useSocket";

type Status =
    | "idle"
    | "connecting"
    | "connected"
    | "reconnecting"
    | "disconnected"
    | "error";

function statusDotStyle(status: Status): React.CSSProperties {
    const colors: Record<Status, string> = {
        connected: "#639922",
        connecting: "#BA7517",
        reconnecting: "#BA7517",
        error: "#E24B4A",
        idle: "var(--color-border-primary)",
        disconnected: "var(--color-border-primary)",
    };
    return {
        width: 8,
        height: 8,
        borderRadius: "50%",
        flexShrink: 0,
        background: colors[status] ?? colors.idle,
    };
}

function StatusBadge({ status }: { status: Status }) {
    const styles: Record<Status, React.CSSProperties> = {
        connected: { background: "#EAF3DE", color: "#3B6D11" },
        connecting: { background: "#FAEEDA", color: "#854F0B" },
        reconnecting: { background: "#FAEEDA", color: "#854F0B" },
        error: { background: "#FCEBEB", color: "#A32D2D" },
        idle: {
            background: "var(--color-background-secondary)",
            color: "var(--color-text-secondary)",
        },
        disconnected: {
            background: "var(--color-background-secondary)",
            color: "var(--color-text-secondary)",
        },
    };
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: "var(--border-radius-md)",
                fontSize: 12,
                fontWeight: 500,
                ...styles[status],
            }}
        >
            {status}
        </span>
    );
}

const card: React.CSSProperties = {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    padding: "1rem 1.25rem",
};

const row: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    fontSize: 13,
};

const rowLabel: React.CSSProperties = {
    color: "var(--color-text-secondary)",
    display: "flex",
    alignItems: "center",
    gap: 6,
};

const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 8,
};

const formLabel: React.CSSProperties = {
    fontSize: 12,
    color: "var(--color-text-secondary)",
    display: "block",
    marginBottom: 4,
};

function CardHeader({
    title,
    ns,
    status,
}: {
    title: string;
    ns: string;
    status: Status;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: "1rem",
            }}
        >
            <div style={statusDotStyle(status)} />
            <span
                style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                }}
            >
                {title}
            </span>
            <span
                style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    background: "var(--color-background-secondary)",
                    color: "var(--color-text-secondary)",
                    padding: "1px 6px",
                    borderRadius: "var(--border-radius-md)",
                }}
            >
                {ns}
            </span>
        </div>
    );
}

function ErrorBox({ message }: { message: string }) {
    return (
        <div
            style={{
                background: "#FCEBEB",
                border: "0.5px solid #F7C1C1",
                borderRadius: "var(--border-radius-md)",
                padding: "8px 12px",
                fontSize: 12,
                color: "#A32D2D",
                marginTop: 8,
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
            }}
        >
            <span>⚠</span> {message}
        </div>
    );
}

function PongBox({ timestamp }: { timestamp: number }) {
    return (
        <div
            style={{
                background: "#EAF3DE",
                border: "0.5px solid #C0DD97",
                borderRadius: "var(--border-radius-md)",
                padding: "8px 12px",
                fontSize: 12,
                color: "#3B6D11",
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
            }}
        >
            ✓ Pong received at {new Date(timestamp).toLocaleTimeString()}
        </div>
    );
}

function MetricCard({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div
            style={{
                background: "var(--color-background-secondary)",
                borderRadius: "var(--border-radius-md)",
                padding: "10px 12px",
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    color: "var(--color-text-tertiary)",
                    marginBottom: 4,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    wordBreak: "break-all",
                }}
            >
                {value}
            </div>
        </div>
    );
}

function getSenderName(msg: any): string {

    if (typeof msg.sender === 'string') {
        return msg.sender;
    }

    if (msg.sender?.email) {
        return msg.sender.email;
    }

    if (msg.user?.email) {
        return msg.user.email;
    }

    if (msg.user?.name) {
        return msg.user.name;
    }

    if (msg.senderName) {
        return msg.senderName;
    }

    return 'Unknown';
}

function ChatRoomViewer({
    messages,
    activeRoomId,
    userFilter,
}: {
    messages: any[];
    activeRoomId?: string | null;
    userFilter: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredMessages = messages.filter((msg) => {
       const sender = getSenderName(msg);

        if (!userFilter) {
            return true;
        }


        return sender.toLowerCase().includes(userFilter.toLowerCase());
    });

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [filteredMessages.length]);

    return (
        <div style={card}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                }}
            >
                <p
                    style={{
                        ...sectionLabel,
                        marginBottom: 0,
                    }}
                >
                    Room chat
                </p>

                <span
                    style={{
                        fontSize: 12,
                        color: "var(--color-text-secondary)",
                    }}
                >
                    {activeRoomId ? activeRoomId.slice(0, 8) + "…" : "No room"}
                </span>
            </div>

            <div
                ref={containerRef}
                style={{
                    height: 380,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: 10,
                    background: "var(--color-background-secondary)",
                    borderRadius: "var(--border-radius-md)",
                }}
            >
                {filteredMessages.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            color: "var(--color-text-secondary)",
                            padding: 40,
                            fontSize: 13,
                        }}
                    >
                        No messages
                    </div>
                )}

                {filteredMessages.map((msg, index) => {
                    const sender = getSenderName(msg);

                    const text = msg.text ?? msg.content ?? msg.message ?? "";

                    return (
                        <div
                            key={msg.id ?? index}
                            style={{
                                background: "var(--color-background-primary)",
                                border: "0.5px solid var(--color-border-tertiary)",
                                borderRadius: "var(--border-radius-md)",
                                padding: 10,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 5,
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 12,
                                    }}
                                >
                                    {sender}
                                </span>

                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {msg.createdAt
                                        ? new Date(msg.createdAt).toLocaleTimeString()
                                        : ""}
                                </span>
                            </div>

                            <div
                                style={{
                                    fontSize: 14,
                                }}
                            >
                                {text}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SocketDebug() {
    const { user } = useAuthContext();
    const { status, error, lastPong, sendPing, isAuthenticated } = useSocket();
    const {
        status: chatStatus,
        error: chatError,
        isAuthenticated: chatAuthenticated,
        activeRoomId,
        rooms,
        messages,
        createRoom,
        joinRoom,
        leaveRoom,
        sendMessage,
        clearMessages,
    } = useChatSocket();

    const [roomName, setRoomName] = useState("Debug room");
    const [roomId, setRoomId] = useState("");
    const [messageText, setMessageText] = useState(
        "Hello from the socket playground",
    );

    const [lastResult, setLastResult] = useState("No action yet");
    const [userFilter, setUserFilter] = useState('');

    const runAction = async (action: () => Promise<unknown>) => {
        try {
            const result = await action();
            setLastResult(JSON.stringify(result, null, 2));
        } catch (e) {
            setLastResult(e instanceof Error ? e.message : String(e));
        }
    };

    const activeRoomShort = activeRoomId ? activeRoomId.slice(0, 8) + "…" : "—";

    return (
        <div style={{ padding: "1.5rem 0", display: "grid", gap: "1rem" }}>
            {/* Header */}
            <div style={{ alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <p
                        style={{
                            fontSize: 18,
                            fontWeight: 500,
                            color: "var(--color-text-primary)",
                        }}
                    >
                        Socket debug
                    </p>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                        {user ? `Authenticated as ${user.email}` : "No user authenticated"}
                    </p>
                </div>
                <button type="button" onClick={sendPing} disabled={!isAuthenticated}>
                    Ping
                </button>
            </div>

            {/* Status cards */}
            <div
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
                {/* Main namespace */}
                <div style={card}>
                    <CardHeader
                        title="Main"
                        ns="ws://localhost:3000"
                        status={status as Status}
                    />
                    <div
                        style={{
                            ...row,
                            borderBottom: "0.5px solid var(--color-border-tertiary)",
                        }}
                    >
                        <span style={rowLabel}>Status</span>
                        <StatusBadge status={status as Status} />
                    </div>
                    <div style={{ ...row, borderBottom: "none" }}>
                        <span style={rowLabel}>Auth</span>
                        <span
                            style={{
                                fontSize: 13,
                                color: isAuthenticated
                                    ? "#3B6D11"
                                    : "var(--color-text-secondary)",
                            }}
                        >
                            {isAuthenticated ? "ready" : "—"}
                        </span>
                    </div>
                    {lastPong && <PongBox timestamp={lastPong.timestamp} />}
                    {error && <ErrorBox message={error} />}
                </div>

                {/* /chat namespace */}
                <div style={card}>
                    <CardHeader title="Chat" ns="/chat" status={chatStatus as Status} />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 8,
                            marginBottom: "1rem",
                        }}
                    >
                        <MetricCard label="Rooms" value={rooms.length} />
                        <MetricCard label="Messages" value={messages.length} />
                        <MetricCard label="Active room" value={activeRoomShort} />
                    </div>
                    <div
                        style={{
                            ...row,
                            borderBottom: "0.5px solid var(--color-border-tertiary)",
                        }}
                    >
                        <span style={rowLabel}>Status</span>
                        <StatusBadge status={chatStatus as Status} />
                    </div>
                    <div style={{ ...row, borderBottom: "none" }}>
                        <span style={rowLabel}>Auth</span>
                        <span
                            style={{
                                fontSize: 13,
                                color: chatAuthenticated
                                    ? "#3B6D11"
                                    : "var(--color-text-secondary)",
                            }}
                        >
                            {chatAuthenticated ? "ready" : "—"}
                        </span>
                    </div>
                    {chatError && <ErrorBox message={chatError} />}
                </div>
            </div>

            {/* Actions */}
            <div
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
                {/* Room actions */}
                <div style={card}>
                    <p style={sectionLabel}>Rooms</p>
                    <div style={{ marginBottom: 12 }}>
                        <label style={formLabel} htmlFor="inp-room-name">
                            Room name
                        </label>
                        <input
                            id="inp-room-name"
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => runAction(() => createRoom({ name: roomName }))}
                        disabled={!roomName}
                        style={{ width: "100%", marginBottom: 12 }}
                    >
                        + Create room
                    </button>
                    <div style={{ marginBottom: 12 }}>
                        <label style={formLabel} htmlFor="inp-room-id">
                            Room ID
                        </label>
                        <input
                            id="inp-room-id"
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="paste roomId here"
                        />
                    </div>
                    <div
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
                    >
                        <button
                            type="button"
                            onClick={() => runAction(() => joinRoom({ roomId }))}
                            disabled={!roomId}
                        >
                            Join
                        </button>
                        <button
                            type="button"
                            onClick={() => runAction(() => leaveRoom({ roomId }))}
                            disabled={!roomId}
                        >
                            Leave
                        </button>
                    </div>
                </div>

                {/* Message actions */}
                <div style={card}>
                    <p style={sectionLabel}>Messages</p>
                    <div style={{ marginBottom: 12 }}>
                        <label style={formLabel} htmlFor="inp-msg">
                            Message text
                        </label>
                        <textarea
                            id="inp-msg"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            style={{ width: "100%", minHeight: 80, resize: "vertical" }}
                        />
                    </div>
                    <div
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                runAction(() => sendMessage({ roomId, text: messageText }))
                            }
                            disabled={!roomId}
                        >
                            Send
                        </button>
                        <button type="button" onClick={clearMessages}>
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat viewer */}

            <div style={card}>

                <p style={sectionLabel}>
                    Filter messages by user
                </p>


                <input
                    type="text"
                    placeholder="email / username"
                    value={userFilter}
                    onChange={(e) =>
                        setUserFilter(e.target.value)
                    }
                    style={{
                        width: '100%'
                    }}
                />

            </div>



            <ChatRoomViewer

                messages={
                    activeRoomId
                        ?
                        messages.filter(
                            (msg) =>
                                msg.roomId === activeRoomId
                        )
                        :
                        []
                }

                activeRoomId={activeRoomId}

                userFilter={userFilter}

            />
            {/* Last result */}
            <div style={card}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                    }}
                >
                    <p style={{ ...sectionLabel, margin: 0 }}>Last result</p>
                    <button
                        type="button"
                        onClick={() => setLastResult("No action yet")}
                        style={{ fontSize: 12, padding: "2px 8px" }}
                    >
                        × Clear
                    </button>
                </div>
                <pre
                    style={{
                        background: "var(--color-background-tertiary)",
                        border: "0.5px solid var(--color-border-tertiary)",
                        borderRadius: "var(--border-radius-md)",
                        padding: 12,
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-primary)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        maxHeight: 200,
                        overflowY: "auto",
                        margin: 0,
                    }}
                >
                    {lastResult}
                </pre>
            </div>
        </div>
    );
}

export default SocketDebug;
