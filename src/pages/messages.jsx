import DirectMessages from "../components/dm/directMessaging";

function Messages({user, onlineUsers}) {
    return (
        <div>
            <DirectMessages user={user} onlineUsers={onlineUsers} />
        </div>
    );
}

export default Messages