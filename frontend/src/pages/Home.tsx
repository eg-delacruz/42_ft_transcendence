import { useAuthContext } from '@/context/context';

/**
 * Home - Landing page
 * Welcome to Transcendence
 */

function Home() {
    const { user } = useAuthContext();

    return (
        <>
            <h1>Welcome to Transcendence</h1>
            <p>This is the home page.</p>

            {user && <p>Logged in as: {user.email}</p>}

        </>
    );
}

export default Home;