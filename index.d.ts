/* eslint-disable no-undef */
declare module '*.scss' {
  const css: { [key: string]: string };
  export default css;
}
declare module '*.sass' {
  const css: { [key: string]: string };
  export default css;
}
declare module 'react-markup';
declare module '*.webp';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

declare global {
  interface Window {
    mservice: BluetoothRemoteGATTService;
    mcharacteristic: BluetoothRemoteGATTCharacteristic;
    mdevice: BluetoothDevice;
  }
}
