function DeviceName() {
    return (
        "Chooj (Kai OS, " +
        navigator.mozWifiManager.macAddress +
        ")"
    );
}

export default DeviceName;