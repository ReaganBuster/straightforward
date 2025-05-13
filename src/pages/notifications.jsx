import NotificationsIndex from "../components/notifications/index";

function Notifications({user}) {
  return (
      <div>
          <NotificationsIndex user={user} />
      </div>
  );
}

export default Notifications