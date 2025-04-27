import FeedComponent from "../components/feed/feed";

function Feed({user}) {
    return (
        <div>
            <FeedComponent user={user} />
        </div>
    );
}

export default Feed