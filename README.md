# RC-IBUS-JS

## A JavaScript implementation of FlySky IBUS protocol
Used for encoding RC channel data (channels 0 to 13) with a value range of 1000 to 2000 per channel (standard RC servo PWM range).

## Why?
I have seen several implmentations of decoding FlySky IBUS data, but encoding to IBUS is harder to find, and I have not seen a JavaScript implementation. My setup is NodeJS running on a Raspberry PI, recieving commands from an Angular interface for Alieron, Elevator, Throttle and Rudder values between 1000 and 2000. This library encodes these into FlySky IBUS protocol so it can be sent to a FlySky IBUS compatable flight controller. 

## Credits
I based the work here on a C++ implementation and the reasearch provided here: https://github.com/pinkfloydfan/iBUSEncoder

## Usage

### Basic
`
    const IBus = require('ibus');

    let instance = new IBus(); // see options for new IBus(options);

    let onUpdate = (buffer) => {
        console.log('data: ' + buffer);
        // do something with encoded buffer data here (ie: send buffer data via UART to flight controller)
    };

    instance.start([1500, 1400, 1300, 1500], onUpdate); // array of up to 14 channel signals. provide optional callback for buffer data notifications
`

### Start encoding
`
    let onUpdate = (buffer) => {
        console.log('data: ' + buffer);
        // do something with encoded buffer data here (ie: send buffer data via UART to flight controller)
    };

    instance.start([1500, 1400, 1300, 1500], onUpdate); // array of up to 14 channel signals. provide optional callback for buffer data notifications
`

note that the optional start callback listener and other listeners attached will be called at an interval, but buffer data is only updated when channel data is updated, so unless channel data is updated, the same buffer will be returned over and over again.


### Update channel data

`
    instance.update([1000, 2000, 1500, 1400]);
`

### Update specific channel data

`
    instance.update(2, 1900); //update channel index 2 to 1900; equivalent to instance.update([1000, 2000, 1900]);
`

### Listen for buffer updates

you can provide an optional callback in the start() command for this, but if you want, you can add a listener at a later time.

`
    let onUpdate = (buffer) => {
        console.log('data: ' + buffer);
        // do something with encoded buffer data here (ie: send buffer data via UART to flight controller)
    };

    instance.listen(onUpdate);
`

### Stop encoding

this will clear the interval associated with start(), and will also remove all listeners. 

`
    instance.stop();
`

### Options

`
    const options = {
        minValue: 1000, // default = 1000. min allowed value per channel
        maxValue: 2000, // default = 2000. max allowed value per channel
        defaultValue: 1500, // default = 1500. specified the start value for all 14 channels
        broadcastInterval: 7, // default = 7. min = 7. number of miliseconds used for returning the current buffer data value to listeners. the IBUS protocol expects data no faster than every 7 miliseconds, which is why thats the min.
        maxListeners: 10 // default = 10. max number of listeners
    }// default = 1000. min allowed value per channel
`
