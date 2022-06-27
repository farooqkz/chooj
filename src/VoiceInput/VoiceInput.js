import { msToHigherScale } from "../utils";
import "./VoiceInput.css";

function VoiceInput({ title, seconds }) {
  return (
    <div className="voiceinput">
      <h6 $HasTextChildren>{title}</h6>
      <h6 $HasTextChildren>{msToHigherScale(seconds * 1000)}</h6>
    </div>
  );
}

export default VoiceInput;
