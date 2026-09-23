import { useEffect, useRef, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useAuthContext } from "@/context/context";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useTranslation } from 'react-i18next';


type Status =
    | "idle"
    | "connecting"
    | "connected"
    | "reconnecting"
    | "disconnected"
    | "error";

function StatusBadge({ status }: { status: Status }) {
	const { t } = useTranslation();
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

	const labels: Record<Status, string> = {
		connected: t("chat.status.connected"),
		connecting: t("chat.status.connecting"),
		reconnecting: t("chat.status.reconnecting"),
		error: t("chat.status.error"),
		idle: t("chat.status.idle"),
		disconnected: t("chat.status.disconnected"),
	};

    return (
        <span className="flex items-center p-2 rounded-xs"
            style={{ ...styles[status],}}
        >
            {status}
        </span>
    );
}

function ErrorBox({ message }: { message: string }) {
    return (
        <div className="flex items-start bg-red-100 text-red-500 rounded-sm p-2">
            <span>⚠</span> {message}
        </div>
    );
}


function getSenderName(msg: any, t:TFunction): string {

    if (msg.sender?.username)
		return msg.sender.username;
	
	if (msg.sender?.email) {
        return msg.sender.email;
    }

    if (msg.user?.email) {
        return msg.user.email;
    }

    return t("chat.unknownUser");
}

export function ChatRoomViewer({
    messages,
    activeRoomId,
}: {
    messages?: any[];
    activeRoomId?: string | null;
}) {
    const [userFilter, setUserFilter] = useState("");
	const safeMessages = Array.isArray(messages) ? messages : [];

	const { user, loading, error } = useUser();
	const [displayName, setDisplayname] = useState(user?.username ?? "");

	const { t } = useTranslation();

	useEffect(() => {
		setDisplayname(user?.username ?? "");
	}, [user]);

    const filteredMessages = safeMessages.filter((msg) => {
        const sender = getSenderName(msg, t);

        if (!userFilter) {
            return true;
        }

        return sender.toLowerCase().includes(userFilter.toLowerCase());
    });

    return (
        <div className="h-7/9 w-full relative mt-2 overflow-y-scroll">
            {/* <div className="flex justify-between items-center m-3 g-3">
                <span className="chatText text-sm font-bold uppercase mb-2 m-0">
                    {activeRoomId ? activeRoomId.slice(0, 8) + "…" : "No room"}
                </span>
            </div> */}

            <div className="fixed chatText text-sm font-bold uppercase mb-2 m-0 bg-slate-900">
                <input className="p-1 w-full"
                    type="text"
                    placeholder={t("chat.filterByUser")}
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                />
            </div>

            <div className="flex flex-col mt-10 ">
                {filteredMessages.length === 0 && (
                    <div className="chatText text-xs font-bold uppercase mb-2 m-0">
                        {t("chat.noMessages")}
                    </div>
                )}

                {filteredMessages.map((msg, index) => {
                    const sender = getSenderName(msg);
                    const text = msg.text ?? msg.content ?? msg.message ?? "";
                    const avatarSrc = msg.sender?.avatarUrl || "/defaultavatar.png";

                    return (
                        <div key={msg.id ?? index} className="flex flex-row w-full gap-4 items-start">
                            <div className="h-10 w-10 shrink-0 overflow-hidden aspect-square rounded-full border-3 border-slate-300">
                                <img src={avatarSrc} alt={`${sender} avatar`} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1 border-b-2 border-slate-700 p-2 wrap-break-word">
                                <div className="flex flex-row justify-between chatText ">
									<span className="chatText font-black uppercase mb-2 m-0 ">
										{sender}
									</span>
									<span className="chatText font-bold uppercase mb-2 m-0">
										{msg.createdAt
											? new Date(msg.createdAt).toLocaleTimeString()
											: ""}
									</span>
								</div>

								<div className="chatText mb-2 m-0">
									{text}
								</div>
							</div>
						</div>
                    );
                })}
            </div>
        </div>
    );
}

export function SocketDebug() {
    const { user } = useAuthContext();
    const {
        status: chatStatus,
        error: chatError,
        activeRoomId,
        messages,
        sendMessage,
    } = useChatSocket();

    const [messageText, setMessageText] = useState("");
	const { t, i18n } = useTranslation();
    const [lastResult, setLastResult] = useState(t("chat.noAction"));

    const runAction = async (action: () => Promise<unknown>) => {
        try {
            const result = await action();
            setLastResult(JSON.stringify(result, null, 2));
        } catch (e) {
            setLastResult(e instanceof Error ? e.message : String(e));
        }
    };

    return (
        <div className="h-full w-full flex flex-col items-stretch">
            {/* Header */}
            <div className="h-1/9 flex justify-between items-center">
                <div>
                    <p className="chatText uppercase font-black p-2">
                        {user ? t("chat.loggedAs", { user: user.username}) : t("chat.noUser")}
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
            <div className="h-1/9 w-full flex flex-row items-center gap-2 ">
                <div className="h-full w-full">
                    <label htmlFor="inp-msg" className="labelCustom"></label>
                    <textarea className="h-full w-full border-2 border-zinc-50 rounded-md bg-zinc-700/50 chatText text-sm p-2"
                        id="inp-msg"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={t("chat.placeholder")}
						maxlength="258"
                    />
                </div>
                <button className="customButton p-3 text-xs"
                    type="button"
                    onClick={() =>
                        runAction(async () => {
                            await sendMessage({ text: messageText });
                            setMessageText("");
                        })
                    }
                    disabled={!messageText.trim()}
                >
                    {t("chat.send")}
                </button>
            </div>

            {chatError && <ErrorBox message={chatError} />}

            {/* Last result - Message debug*/}
            {/* <div>
                <div className="flex items-center justify-between mb-2">
                    <p>Last result</p>
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
            </div> */}
        </div>
    );
}

export default SocketDebug;
