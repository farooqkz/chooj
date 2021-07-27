import "./Avatar.css";

const presenceColor = {
  online: "green",
  offline: "gray",
  unavailable: "orange",
};

function Avatar(props) {
  return (
    <div className="avatar">
      <img className="avatar-img" alt="" src={props.avatar} />
      <div className="avatar-presence" style={{ "background-color": presenceColor[props.online] }}>
      </div>
    </div>
  );
}

export default Avatar;
