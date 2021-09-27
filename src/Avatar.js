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
    {props.online? <div
        className="avatar-presence"
        style={{ "background-color": presenceColor[props.online] }}
      ></div>:null}
    </div>
  );
}

export default Avatar;
