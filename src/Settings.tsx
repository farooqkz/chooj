


interface Preferences {
  adShowFreq: "startup" | number;
  serversForPublicDirectory: string[];
  mediaLoading: "always" | "only_on_wifi" | "only_on_request";
  inviteAutoAccept: boolean;
}




function Settings() {
  return (
    <p>
      Press center key to enable push notifification in Chooj.
      <br />
      This is <b>unreliable</b>, <b>experimental</b> and <b>CANNOT BE UNDONE</b>
      .
      <br />
      You cannot disable or enable notifications per room or sender through
      Chooj.
      <br />
      If enabling push notifications was causing problems for you, you may
      reinstall Chooj.
    </p>
  );
}

export default Settings;
