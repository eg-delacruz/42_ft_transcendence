import { useAuthContext } from '@/context/context';
import { useSocket } from '@/hooks/useSocket';

/**
 * SocketDebug - Temporary page for testing and debugging Socket.IO connection
 * This page can be easily deleted once Socket.IO is fully integrated
 * 
 * Shows:
 *  - Authentication state
 *  - Socket connection status
 *  - Errors and last pong response
 *  - Manual ping/pong test
 */

function SocketDebug() {
    const { user } = useAuthContext();
    const { status, error, lastPong, sendPing, isAuthenticated } = useSocket();

    return (
        <>
            <h2>Socket.IO Debug Panel</h2>

            <section style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
                <h3>Connection Status</h3>
                <p><strong>Authenticated user:</strong> {user ? user.email : 'guest'}</p>
                <p><strong>Socket auth ready:</strong> {isAuthenticated ? '✓ yes' : '✗ waiting for auth'}</p>
                <p><strong>Socket status:</strong> <span style={{ fontWeight: 'bold', color: status === 'connected' ? 'green' : status === 'error' ? 'red' : 'orange' }}>{status}</span></p>

                {error && (
                    <p style={{ color: 'red' }}>
                        <strong>Error:</strong> {error}
                    </p>
                )}

                {lastPong && (
                    <p style={{ color: 'green' }}>
                        <strong>Pong received at:</strong> {new Date(lastPong.timestamp).toLocaleTimeString()}
                    </p>
                )}
            </section>

            <section style={{ padding: '20px', marginTop: '20px' }}>
                <button
                    type="button"
                    onClick={sendPing}
                    disabled={!isAuthenticated}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                        opacity: isAuthenticated ? 1 : 0.5,
                    }}
                >
                    Send Ping
                </button>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>
                    Click to send a ping event to the backend. Make sure you are logged in and the socket is connected.
                </p>
            </section>

            <section style={{ padding: '20px', marginTop: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h3>Instructions</h3>
                <ol>
                    <li>Make sure you are logged in (check Authenticated user above)</li>
                    <li>Wait for Socket status to change to "connected"</li>
                    <li>Click "Send Ping" button</li>
                    <li>You should see "Pong received at" with a timestamp</li>
                    <li>Try restarting the backend and watch the status go to "reconnecting" then back to "connected"</li>
                </ol>
            </section>
        </>
    );
}

export default SocketDebug;
