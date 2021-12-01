import "./Avatar.css";

const presenceColor = {
  online: "green",
  offline: "gray",
  unavailable: "orange",
};

function Avatar({ avatar, online }) {
  return (
    <div className="avatar">
      <img className="avatar-img" alt="" src={avatar} />
      {online ? (
        <div
          className="avatar-presence"
          style={{ "background-color": presenceColor[online] }}
        ></div>
      ) : null}
    </div>
  );
}

export default Avatar;
