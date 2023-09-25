class IBus {

    constructor(config) {
      config = config || {};
      this.minValue = config.minValue || 1000;
      this.maxValue = config.maxValue || 2000;
      this.defaultValue = config.defaultValue || 1500;
      this.broadcastInterval = Math.max((config.broadcastInterval || 7), 7); //miliseconds... minimum 7
      this.maxListeners = config.maxListeners || 10;
      this.channelData = Array.from({length: 14}).map(() => this.defaultValue);
      this.buffer = new ArrayBuffer(32);
      this.view = new DataView(this.buffer);
      this.view.setUint8(0, 32); // header 1st byte = 0x20
      this.view.setUint8(1, 64); // header 2nd byte = 0x40
      this.initialChecksumValue = 65535 - 32 - 64; // 2 byte max value, minus the first two bytes
      this.listeners = [];
      this.running = null;
      this.encode();
    }
  
    verifyValueRange(channelValue) {
      if (channelValue < this.minValue) {
        return this.minValue;
      }
      if (channelValue > this.maxValue) {
        return this.maxValue;
      }
      return channelValue;
    }
  
    encode(max) { //encode channel data to array buffer. optional 'max' value can be used to skip channels that arent used.
      max = max || this.channelData.length;
      let checksum = this.initialChecksumValue;
      this.channelData.forEach((val, i) => {
        if (i < max) {
          let startIndex = (i * 2) + 2;
          this.view.setUint16(startIndex, val, true);
          console.log(this.view.getUint16(startIndex, true));
          let byte0 = this.view.getUint8(startIndex);
          let byte1 = this.view.getUint8(startIndex + 1);
          checksum -= byte0;
          checksum -= byte1;
        }
      });
      this.view.setUint16(this.buffer.byteLength - 2, checksum, true);
      return this.buffer;
    }
  
    update(channelData) { // array of up to 14 channles of data, which should be integers in the range of 1000 to 2000 (standard RC Servo range)
      this.channelData = this.channelData.map((channelValue, i) => {
        if(channelData.length > i) {
          return this.verifyValueRange(channelData[i]);
        }
        return channelValue;
      });
      return this.encode(channelData.length);
    };
  
    updateChannel(channelIndex, value) { // update a particular value by index
      if (channelIndex >= 0 && channelIndex < 14) {
        this.channelData[channelIndex] = this.verifyValueRange(value);
        return this.encode(channelIndex + 1);
      } else {
        throw new Error(`Channel index ${channelIndex} out of bounds. Must be between 0 and 13.`)
      }
    };
  
    listen(cb) {
      if(cb) {
        if (this.listeners.length < this.maxListeners) {
          this.listeners.push(cb);
        } else {
          throw new Error(`Max listeners (${this.maxListeners}) reached on IBUS. Check for memory leak.`)
        }
      }
    };
  
    stop() {
      clearInterval(this.running);
      this.running = null;
      this.listeners = [];
    };
  
    start(channelData, cb) {
      if (this.running) {
        this.stop();
      }
      if(cb) {
        this.listen(cb);
      }
      if(channelData) {
        this.update(channelData);
      }
      this.running = setInterval(() => this.listeners.forEach(listener => listener(this.buffer)), this.broadcastInterval);
    };
  
  }
  
  module.exports = {
    IBus
  }
  