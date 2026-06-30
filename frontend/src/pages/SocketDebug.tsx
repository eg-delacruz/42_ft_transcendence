import { useEffect, useRef, useState } from "react";

import { useAuthContext } from "@/context/context";
import { useChatSocket } from "@/hooks/useChatSocket";

type Status =
    | "idle"
    | "connecting"
    | "connected"
    | "reconnecting"
    | "disconnected"
    | "error";

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

function getSenderName(msg: any): string {
    if (typeof msg.sender === "string") {
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

    return "Unknown";
}

function ChatRoomViewer({
    messages,
    activeRoomId,
}: {
    messages: any[];
    activeRoomId?: string | null;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [userFilter, setUserFilter] = useState("");

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
                    gap: 12,
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

            <div style={{ marginBottom: 12 }}>
                <input
                    type="text"
                    placeholder="Filter by user..."
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    style={{ width: "100%" }}
                />
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
    const {
        status: chatStatus,
        error: chatError,
        activeRoomId,
        messages,
        sendMessage,
    } = useChatSocket();

    const [messageText, setMessageText] = useState("");
    const [lastResult, setLastResult] = useState("No action yet");

    const runAction = async (action: () => Promise<unknown>) => {
        try {
            const result = await action();
            setLastResult(JSON.stringify(result, null, 2));
        } catch (e) {
            setLastResult(e instanceof Error ? e.message : String(e));
        }
    };

    return (
        <div style={{ padding: "1.5rem 0", display: "grid", gap: "1rem" }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <p
                        style={{
                            fontSize: 18,
                            fontWeight: 500,
                            color: "var(--color-text-primary)",
                        }}
                    >
                        Global Chat
                    </p>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                        {user ? `Logged in as ${user.email}` : "No user authenticated"}
                    </p>
                </div>
                <StatusBadge status={chatStatus as Status} />
            </div>

            {/* Chat viewer */}
            <ChatRoomViewer
                messages={
                    activeRoomId
                        ? messages.filter((msg) => msg.roomId === activeRoomId)
                        : []
                }
                activeRoomId={activeRoomId}
            />

            {/* Message input */}
            <div style={card}>
                <p style={sectionLabel}>Send message</p>
                <div style={{ marginBottom: 12 }}>
                    <label style={formLabel} htmlFor="inp-msg">
                        Message text
                    </label>
                    <textarea
                        id="inp-msg"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        style={{ width: "100%", minHeight: 80, resize: "vertical" }}
                    />
                </div>
                <button
                    type="button"
                    onClick={() =>
                        runAction(() => sendMessage({ text: messageText }))
                    }
                    disabled={!messageText.trim()}
                    style={{ width: "100%" }}
                >
                    Send
                </button>
            </div>

            {chatError && <ErrorBox message={chatError} />}

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
