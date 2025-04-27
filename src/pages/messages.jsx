import DirectMessages from "../components/dm/directMessaging";

function Messages({user}) {
    return (
        <div>
            <DirectMessages user={user} />
        </div>
    );
}

export default Messages