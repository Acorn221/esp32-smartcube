/* eslint-disable no-undef */
import React, { useEffect, useRef, useState } from 'react';
import * as SRVisualizer from 'sr-visualizer';

import {
  isWebBluetoothSupported,
  connectToBluetoothDevice,
  startNotifications,
  disconnectFromBluetoothDevice,
} from '@/helpers/bluetooth';
import {
  decrypt,
  getMove,
  getState,
} from '@/helpers/decode';

import '@/index.css';
import parseCube from '@/helpers/parseCube';

const faceColorMap = ['g', 'y', 'r', 'w', 'o', 'b'];

const App = () => {
  const imageContainer = useRef<HTMLDivElement | null>(null);
  const [device, setDevice] = useState<BluetoothDevice | undefined>();
  const [cubeState, setCubeState] = React.useState(
    'bbbbbbbbboooooooooyyyyyyyyygggggggggrrrrrrrrrwwwwwwwww',
  );

  const disconnect = () => {
    if (!device) return;
    disconnectFromBluetoothDevice(device);
    setDevice(undefined);
  };

  const connectToDevice = async () => {
    // a quick check for bluetooth support in the browser
    if (!isWebBluetoothSupported) {
      alert('Browser does not support bluetooth');
      return;
    }
    const connectResponse = await connectToBluetoothDevice();
    if (!connectResponse) {
      console.log('No cube connected');
      return;
    }
    const { server, device: connectedDevice } = connectResponse;
    setDevice(connectedDevice);
    const characteristic = await startNotifications(server);
    characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
      if (!event.target?.value) return;
      const { value } = event.target; // 20 bytes sent by the cube
      const uint8array = decrypt(new Uint8Array(value.buffer));
      const state = getState(uint8array);
      console.log(state);
      console.log(`Move: ${getMove(uint8array)}`);
      const newCubeState = parseCube(value) // We parse it to an array of 54 colors (1...6)
        .map((faceletColor) => faceColorMap[faceletColor - 1])
        .join('');
      setCubeState(newCubeState);
    });
    connectedDevice.addEventListener('gattserverdisconnected', () => {
      disconnectFromBluetoothDevice(connectedDevice);
    });
  };

  // disconnect from the cube when the component unmounts
  useEffect(() => () => {
    disconnect();
  }, [device]);

  useEffect(() => {
    if (!imageContainer.current) return;
    imageContainer.current.innerHTML = '';
    SRVisualizer.cubeSVG(
      imageContainer.current,
      `visualcube.php?fmt=svg&r=x-90y-120x-20&size=300&fc=${cubeState}`,
    );
  }, [cubeState]);

  return (
    <div className="flex justify-center align-middle h-screen">
      <div className="bg-white m-auto p-10 rounded-xl w-3/4 md:w-1/2 text-center flex flex-col">
        <div className="m-auto">
          <div ref={imageContainer} />
        </div>
        {
          device ? (
            <button className="btn btn-secondary" onClick={disconnect}>
              Disconnect from the cube!
            </button>
          ) : (

            <button className="btn btn-primary" onClick={connectToDevice}>
              Connect to the cube!
            </button>
          )
        }
      </div>
    </div>
  );
};

export default App;
