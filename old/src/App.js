import logo from './logo.svg';
import './App.css';
import React from 'react';
import {
  isWebBluetoothSupported,
  connectToBluetoothDevice,
  startNotifications,
  disconnectFromBluetoothDevice,
} from './bluetooth.js';
import {
  decrypt,
  getMove,
  getState,
} from './decode.js';
const App = () => {
  const [device, setDevice] = React.useState(null);

  React.useEffect(() => {
    // returned function will be called on component unmount
    return () => {
      disconnectFromBluetoothDevice(device);
    };
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button
          onClick={async () => {
            // a quick check for bluetooth support in the browser
            if (!isWebBluetoothSupported) {
              alert('Browser does not support bluetooth');
              return;
            }

            const { server, device: connectedDevice } = await connectToBluetoothDevice();
            setDevice(connectedDevice);
            const characteristic = await startNotifications(server);
            characteristic.addEventListener('characteristicvaluechanged', (event) => {
              const { value } = event.target; // 20 bytes sent by the cube
              const uint8array = decrypt(new Uint8Array(value.buffer));
              const state = getState(uint8array);
              console.log(state);
              console.log(`Move: ${getMove(uint8array)}`)
            });
            connectedDevice.addEventListener('gattserverdisconnected', () => {
              disconnectFromBluetoothDevice(connectedDevice);
            });
          }}
        >
          connect
        </button>
      </header>
    </div>
  );
};

export default App;
