import serverIcon from "url:./server_icon.svg";
import userIcon from "url:../person_icon.png";

function StepTwo() {
  return (
    <div className="step">
      <p>
        Users of each homeserver can communicate with the users of the same
        homeserver. But there's more! Users of different homeservers can
        communicate together, too!
      </p>
      <div>
        <img
          src={serverIcon}
          height={24}
          width={24}
          alt=""
          style={{ bottom: "6vh", left: "28vw" }}
        />
        <svg viewBox="0 0 240 140" stroke="black" style={{ top: "52vh" }}>
          <line x1="90" x2="105" y1="18" y2="24" />
          <line x1="150" x2="135" y1="18" y2="24" />
          {/* these two lines belong to the users of the top homeserver */}

          <line x1="130" x2="145" y1="40" y2="68" />
          <line x1="95" x2="110" y1="68" y2="40" />
          <line x1="98" x2="142" y1="80" y2="80" />
          {/* these lines belong to lines between homeservers */}

          <line x1="58" x2="68" y1="70" y2="76" />
          <line x1="60" x2="68" y1="94" y2="88" />
          {/* these two lines belong to the users of the left homeserver */}

          <line x1="172" x2="182" y1="90" y2="98" />
          <line x1="172" x2="182" y1="76" y2="70" />
          {/* these two lines belong to the users of the right homeserver */}
        </svg>
        <img
          src={userIcon}
          height={14}
          width={14}
          alt=""
          style={{ bottom: "-16vh", left: "-8vw" }}
        />
        <img
          src={userIcon}
          height={14}
          width={14}
          alt=""
          style={{ bottom: "-5vh", left: "-16vw" }}
        />
        <img
          src={serverIcon}
          height={24}
          width={24}
          alt=""
          style={{ bottom: "-12vh", left: "-10vw" }}
        />
        <img
          src={userIcon}
          height={14}
          width={14}
          alt=""
          style={{ bottom: "12vh", left: "-18vw" }}
        />
        <img
          src={userIcon}
          height={14}
          width={14}
          alt=""
          style={{ bottom: "12vh", left: "8vw" }}
        />
        <img
          src={serverIcon}
          height={24}
          width={24}
          alt=""
          style={{ bottom: "-12vh" }}
        />
        <img
          src={userIcon}
          height={14}
          width={14}
          alt=""
          style={{ bottom: "-16vh", left: "6vw" }}
        />
        <img
          src={userIcon}
          height={14}
          width={14}
          alt=""
          style={{ bottom: "-5vh" }}
        />
      </div>
    </div>
  );
}

export default StepTwo;
