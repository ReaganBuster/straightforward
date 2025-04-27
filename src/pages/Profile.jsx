import ProfileIndex from "../components/profile";

function Profile({user}) {
    return (
        <div>
            <ProfileIndex user={user}/>
        </div>
    );
}

export default Profile