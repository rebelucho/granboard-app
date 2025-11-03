import { CreateSegment, Segment, SegmentID } from "./boardinfo";

const GRANBOARD_UUID = "442f1570-8a00-9a28-cbe1-e1d4212d53eb";

const SEGMENT_MAPPING = {
  "50-46-51-64": SegmentID.INNER_1,
  "50-46-52-64": SegmentID.TRP_1,
  "50-46-53-64": SegmentID.OUTER_1,
  "50-46-54-64": SegmentID.DBL_1,
  "57-46-49-64": SegmentID.INNER_2,
  "57-46-48-64": SegmentID.TRP_2,
  "57-46-50-64": SegmentID.OUTER_2,
  "56-46-50-64": SegmentID.DBL_2,
  "55-46-49-64": SegmentID.INNER_3,
  "55-46-48-64": SegmentID.TRP_3,
  "55-46-50-64": SegmentID.OUTER_3,
  "56-46-52-64": SegmentID.DBL_3,
  "48-46-49-64": SegmentID.INNER_4,
  "48-46-51-64": SegmentID.TRP_4,
  "48-46-53-64": SegmentID.OUTER_4,
  "48-46-54-64": SegmentID.DBL_4,
  "53-46-49-64": SegmentID.INNER_5,
  "53-46-50-64": SegmentID.TRP_5,
  "53-46-52-64": SegmentID.OUTER_5,
  "52-46-54-64": SegmentID.DBL_5,
  "49-46-48-64": SegmentID.INNER_6,
  "49-46-49-64": SegmentID.TRP_6,
  "49-46-51-64": SegmentID.OUTER_6,
  "52-46-52-64": SegmentID.DBL_6,
  "49-49-46-49-64": SegmentID.INNER_7,
  "49-49-46-50-64": SegmentID.TRP_7,
  "49-49-46-52-64": SegmentID.OUTER_7,
  "56-46-54-64": SegmentID.DBL_7,
  "54-46-50-64": SegmentID.INNER_8,
  "54-46-52-64": SegmentID.TRP_8,
  "54-46-53-64": SegmentID.OUTER_8,
  "54-46-54-64": SegmentID.DBL_8,
  "57-46-51-64": SegmentID.INNER_9,
  "57-46-52-64": SegmentID.TRP_9,
  "57-46-53-64": SegmentID.OUTER_9,
  "57-46-54-64": SegmentID.DBL_9,
  "50-46-48-64": SegmentID.INNER_10,
  "50-46-49-64": SegmentID.TRP_10,
  "50-46-50-64": SegmentID.OUTER_10,
  "52-46-51-64": SegmentID.DBL_10,
  "55-46-51-64": SegmentID.INNER_11,
  "55-46-52-64": SegmentID.TRP_11,
  "55-46-53-64": SegmentID.OUTER_11,
  "55-46-54-64": SegmentID.DBL_11,
  "53-46-48-64": SegmentID.INNER_12,
  "53-46-51-64": SegmentID.TRP_12,
  "53-46-53-64": SegmentID.OUTER_12,
  "53-46-54-64": SegmentID.DBL_12,
  "48-46-48-64": SegmentID.INNER_13,
  "48-46-50-64": SegmentID.TRP_13,
  "48-46-52-64": SegmentID.OUTER_13,
  "52-46-53-64": SegmentID.DBL_13,
  "49-48-46-51-64": SegmentID.INNER_14,
  "49-48-46-52-64": SegmentID.TRP_14,
  "49-48-46-53-64": SegmentID.OUTER_14,
  "49-48-46-54-64": SegmentID.DBL_14,
  "51-46-48-64": SegmentID.INNER_15,
  "51-46-49-64": SegmentID.TRP_15,
  "51-46-50-64": SegmentID.OUTER_15,
  "52-46-50-64": SegmentID.DBL_15,
  "49-49-46-48-64": SegmentID.INNER_16,
  "49-49-46-51-64": SegmentID.TRP_16,
  "49-49-46-53-64": SegmentID.OUTER_16,
  "49-49-46-54-64": SegmentID.DBL_16,
  "49-48-46-49-64": SegmentID.INNER_17,
  "49-48-46-48-64": SegmentID.TRP_17,
  "49-48-46-50-64": SegmentID.OUTER_17,
  "56-46-51-64": SegmentID.DBL_17,
  "49-46-50-64": SegmentID.INNER_18,
  "49-46-52-64": SegmentID.TRP_18,
  "49-46-53-64": SegmentID.OUTER_18,
  "49-46-54-64": SegmentID.DBL_18,
  "54-46-49-64": SegmentID.INNER_19,
  "54-46-48-64": SegmentID.TRP_19,
  "54-46-51-64": SegmentID.OUTER_19,
  "56-46-53-64": SegmentID.DBL_19,
  "51-46-51-64": SegmentID.INNER_20,
  "51-46-52-64": SegmentID.TRP_20,
  "51-46-53-64": SegmentID.OUTER_20,
  "51-46-54-64": SegmentID.DBL_20,
  "56-46-48-64": SegmentID.BULL,
  "52-46-48-64": SegmentID.DBL_BULL,
  "66-84-78-64": SegmentID.RESET_BUTTON,
};

export class Granboard {
  private readonly bluetoothConnection: BluetoothRemoteGATTCharacteristic;
  private readonly writeCharacteristic?: BluetoothRemoteGATTCharacteristic;
  private readonly connectionTime: number;

  public segmentHitCallback?: (segment: Segment) => void;

  /**
   * Try to reconnect to a previously authorized Granboard automatically
   * Returns null if no device was previously authorized
   */
  public static async TryAutoConnect(): Promise<Granboard | null> {
    try {
      // Check if browser supports getDevices (not all browsers do)
      if (!navigator.bluetooth.getDevices) {
        console.log("⚠️ Browser doesn't support automatic reconnection");
        return null;
      }

      const devices = await navigator.bluetooth.getDevices();
      const granboard = devices.find((device) =>
        device.name?.toLowerCase().includes("gran")
      );

      if (!granboard || !granboard.gatt) {
        console.log("ℹ️ No previously authorized Granboard found");
        return null;
      }

      console.log("🔄 Reconnecting to", granboard.name);

      if (!granboard.gatt.connected) {
        await granboard.gatt.connect();
      }

      const service = await granboard.gatt.getPrimaryService(GRANBOARD_UUID);

      let boardCharacteristic = (await service.getCharacteristics()).find(
        (characteristic) => characteristic.properties.notify
      );

      if (!boardCharacteristic) {
        throw new Error("Could not find matching bluetooth characteristic on dartboard");
      }

      let writeCharacteristic = (await service.getCharacteristics()).find(
        (characteristic) => characteristic.properties.write || characteristic.properties.writeWithoutResponse
      );

      const board = new Granboard(boardCharacteristic, writeCharacteristic);
      await boardCharacteristic.startNotifications();

      console.log("✅ Auto-reconnected to Granboard");
      return board;
    } catch (error) {
      console.error("❌ Auto-reconnect failed:", error);
      return null;
    }
  }

  /**
   * Connect to a Granboard with user interaction (shows browser pairing dialog)
   */
  public static async ConnectToBoard(): Promise<Granboard> {
    const boardBluetooth = await navigator.bluetooth.requestDevice({
      filters: [{ services: [GRANBOARD_UUID] }],
    });

    if (!boardBluetooth || !boardBluetooth.gatt) {
      throw new Error("Could not find matching service on bluetooth dartboard");
    }

    if (!boardBluetooth.gatt.connected) {
      await boardBluetooth.gatt.connect();
    }

    const service = await boardBluetooth.gatt.getPrimaryService(GRANBOARD_UUID);

    // Find the characteristic that supports the notify property. That is the one that executes when
    // a dartboard segment is hit
    let boardCharacteristic = (await service.getCharacteristics()).find(
      (characteristic) => characteristic.properties.notify
    );

    if (!boardCharacteristic) {
      throw new Error(
        "Could not find matching bluetooth charactaristic on dartboard"
      );
    }

    // Find the characteristic that supports write property for LED control
    let writeCharacteristic = (await service.getCharacteristics()).find(
      (characteristic) => characteristic.properties.write || characteristic.properties.writeWithoutResponse
    );

    const board = new Granboard(boardCharacteristic, writeCharacteristic);

    await boardCharacteristic.startNotifications();

    return board;
  }

  private constructor(
    bluetoothConnection: BluetoothRemoteGATTCharacteristic,
    writeCharacteristic?: BluetoothRemoteGATTCharacteristic
  ) {
    this.bluetoothConnection = bluetoothConnection;
    this.writeCharacteristic = writeCharacteristic;
    this.connectionTime = Date.now();

    this.bluetoothConnection.addEventListener(
      "characteristicvaluechanged",
      this.onSegmentHit.bind(this)
    );
  }

  private onSegmentHit() {
    if (!this.bluetoothConnection.value) {
      return; // There is no new value
    }

    // Ignore events in the first 2 seconds after connection to avoid false triggers
    const timeSinceConnection = Date.now() - this.connectionTime;
    if (timeSinceConnection < 2000) {
      console.log(`⏳ Ignoring event (${timeSinceConnection}ms after connection) - warming up`);
      return;
    }

    const segmentUID = new Uint8Array(
      this.bluetoothConnection.value.buffer
    ).join("-");
    const segmentID = (SEGMENT_MAPPING as any)[segmentUID]; // There is probably a type safe way without resulting to "any"

    if (segmentID !== undefined) {
      console.log(segmentID);
      this.segmentHitCallback?.(CreateSegment(segmentID));
    } else {
      // Treat unknown segments as MISS (out of bounds)
      console.log(`Unknown segment UID: ${segmentUID} - treating as MISS`);
      this.segmentHitCallback?.(CreateSegment(SegmentID.MISS));
    }
  }

  /**
   * Light up specific segments on the Granboard 3s
   * Granboard 3s uses a different protocol - we need to disable LED control for now
   * @param segments Array of segment numbers to light up (e.g., [15, 16, 17, 18, 19, 20, 25] for Cricket)
   */
  public async setLEDs(segments: number[]): Promise<void> {
    if (!this.writeCharacteristic) {
      console.warn("❌ LED control not available - no write characteristic found");
      return;
    }

    // TEMPORARILY DISABLED: The Granboard 3s protocol for LED control is different
    // The current implementation causes incorrect LED behavior
    // TODO: Research correct Granboard 3s LED protocol

    console.log("⚠️ LED control temporarily disabled for Granboard 3s");
    console.log("Target segments:", segments);
    return;

    /* ORIGINAL CODE - DISABLED
    try {
      console.log("🔦 Attempting to set LEDs for segments:", segments);

      // Create a 32-bit bitmap for segments 1-25
      let bitmap = 0;
      segments.forEach(segmentNum => {
        if (segmentNum >= 1 && segmentNum <= 25) {
          bitmap |= (1 << (segmentNum - 1));
        }
      });

      // Convert bitmap to bytes (little endian, 4 bytes)
      const command = new Uint8Array([
        0x50, // Command byte 'P' for Pattern/LED control
        (bitmap >> 0) & 0xFF,
        (bitmap >> 8) & 0xFF,
        (bitmap >> 16) & 0xFF,
        (bitmap >> 24) & 0xFF
      ]);

      console.log("📤 Sending LED command:", Array.from(command).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '));

      await this.writeCharacteristic.writeValue(command);
      console.log("✅ LED command sent successfully");
    } catch (error) {
      console.error("❌ Failed to set LEDs:", error);
    }
    */
  }

  /**
   * Turn off all LEDs
   */
  public async clearLEDs(): Promise<void> {
    if (!this.writeCharacteristic) {
      return;
    }

    // TEMPORARILY DISABLED: Same as setLEDs
    console.log("⚠️ LED clear temporarily disabled for Granboard 3s");
    return;

    /* ORIGINAL CODE - DISABLED
    try {
      console.log("🔦 Clearing all LEDs");

      // Command to clear all LEDs - send bitmap of 0
      const command = new Uint8Array([0x50, 0x00, 0x00, 0x00, 0x00]);

      await this.writeCharacteristic.writeValue(command);
      console.log("✅ LEDs cleared");
    } catch (error) {
      console.error("❌ Failed to clear LEDs:", error);
    }
    */
  }
}
