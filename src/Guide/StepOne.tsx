import serverIcon from "url:./server_icon.svg";
import userIcon from "url:../person_icon.png";

function StepOne() {
  return (
    <div className="step">
      <p>
        chooj is an Instant Messenger based on the Matrix network and protocol.
        In the Matrix network there are different homeservers with their users.
      </p>
      <div>
        <img
          style={{ left: "12vw" }}
          src={serverIcon}
          height={42}
          width={42}
          alt=""
        />
        <svg viewBox="0 0 240 80" stroke="black" style={{ top: "64vh" }}>
          <line x1="75" x2="95" y1="10" y2="8" />
          <line x1="122" x2="122" y1="34" y2="14" />
          <line x1="150" x2="175" y1="8" y2="10" />
        </svg>
        <img
          style={{ left: "-25vw" }}
          src={userIcon}
          height={18}
          width={18}
          alt=""
        />
        <img
          style={{ left: "19vw" }}
          src={userIcon}
          height={18}
          width={18}
          alt=""
        />
        <img
          style={{ left: "-15vw", bottom: "-12vh" }}
          src={userIcon}
          height={18}
          width={18}
          alt=""
        />
      </div>
    </div>
  );
}

export default StepOne;
