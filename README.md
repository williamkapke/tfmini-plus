# tfmini-plus
A Node.js library for the TFMini Plus

The TFMini Plus supports UART and I2C communication. The factory default is UART
and [can be changed programmatically](examples/switch_to_i2c.js).


![tfmini-plis](TFMiniPlus.jpg)


```
npm install tfmini-plus @serialport/bindings
```

## Use
```js
const tfminiplus = require('tfmini-plus')
tfminiplus.UART('/dev/serial0', { baudRate: 115200 }).then(async (tfmp) => {
  const measurements = await tfmp.measure()
  console.log('distance:', measurements.distance)
  console.log('strength:', measurements.strength)
  console.log('temperature:', measurements.temperature)
})
.catch(console.error)
```

## BYO[protocol]
Since you can communicate using I2C _or_ UART- I've opted to leave the communication protocol
libraries out to keep from installing extra cruft that isn't needed.

This means **you will need to install the [i2c-bus-promise](https://www.npmjs.com/package/i2c-bus-promise) or
[@serialport/bindings](https://www.npmjs.com/package/@serialport/bindings) independently**.

## i2c-bus-promise
```
npm install i2c-bus-promise
```
This library is **async** (Promise) based. The [i2c-bus](https://www.npmjs.com/package/i2c-bus) is not. The
[i2c-bus-promise](https://www.npmjs.com/package/i2c-bus-promise) library is just a promise wrapper for it.

You should be able to reuse an existing instance of [i2c-bus](https://www.npmjs.com/package/i2c-bus) if you
already have one installed.

## Interface

All functions return a Promise.

**DON'T FORGET TO `await` (or use `.then()`)!!**

### I2C(bus, address)
Creates an I2C tfminiplus instance.

**bus:** The [i2c-bus-promise](https://www.npmjs.com/package/i2c-bus-promise) instance<br>
**address:** The i2c device address (factory default is `0x10`)

**Returns:** a Promise that resolve with the tfminiplus instance.

### UART(path, options)
Creates an UART tfminiplus instance.

**path:** The device path<br>
**options:** The [serialport options](https://serialport.io/docs/api-stream#openoptions)

**Returns:** a Promise that resolve with the tfminiplus instance.

### The `tfminiplus` instance

#### version()
Returns the device version number (string)

#### measure(unit = '`mm`')
Gets a measurement from the device.

**returns:**
```
{
    distance: number,
    strength: number,
    temperature: number
}
```

#### distance(unit = '`mm`')
Does the same thing as `measure()`, but only returns the distance (number).

#### address(addr)
Changes the I2C device address. You must call `save()` to have the setting persist.

#### save()
Saves the current device settings.

#### reset()
Resets the device.

#### restore()
Restores the factory settings.

#### mode(type='`i2c`')
Sets the mode: `i2c` or `uart`

# References
https://acroname.com/sites/default/files/assets/sj-pm-tfmini_plus_a04_product_mannual_en.pdf

# License
MIT
