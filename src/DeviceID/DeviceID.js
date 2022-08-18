function DeviceID() {
    return (
        "Chooj (Kai OS, " +
        navigator.mozWifiManager.macAddress +
        ")"
    );
}

export default DeviceID;