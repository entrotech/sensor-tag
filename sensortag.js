var noble = require("noble");

noble.on("stateChange", function(state) {
  if (state === "poweredOn") {
    noble.startScanning(); // any service UUID
  } else {
    console.log("Please power-on the Bluetooth adapter");
  }
});

noble.on("discover", function(peripheral) {
  var localName = peripheral.advertisement.localName;
  // find the sensor tag based on localName
  if (localName && localName.match(/Sensor/)) {
    noble.stopScanning();
    console.log("Attempting to connect to " + localName);
    connectAndSetUpSensorTag(peripheral);
  }
});

function connectAndSetUpSensorTag(peripheral) {
  peripheral.connect(function(error) {
    console.log("Connected to ", peripheral.advertisement.localName);
    if (error) {
      console.log("There was an error connecting: " + error);
      return;
    }
    var serviceUUIDs = ["FFE0"];
    var characteristicUUIDs = ["FFE1"];
    peripheral.discoverSomeServicesAndCharacteristics(
      serviceUUIDs,
      characteristicUUIDs,
      onServicesAndCharacteristicsDiscovered
    );
  });

  peripheral.on("disconnect", onDisconnect);
}

function onServicesAndCharacteristicsDiscovered(
  error,
  services,
  characteristics
) {
  if (error) {
    console.log("Error discovering services and characteristics " + error);
    return;
  }

  var characteristic = characteristics[0];
  characteristic.notify(true);
  characteristic.on("notify", function(isNotifying) {
    if (isNotifying) {
      console.log("SensorTag remote is ready");
    }
  });

  characteristic.on("data", onCharacteristicData);
}

function onCharacterisiticData(data, isNotification) {
  switch (data[0]) {
    case 0:
      console.log("No buttons are pressed");
      break;
    case 1:
      console.log("Right button is pressed");
      break;

    case 2:
      console.log("Left button is pressed");
      break;

    case 3:
      console.log("Both buttons are pressed");
      break;
    default:
      console.log("Error " + data[0]);
  }
}
