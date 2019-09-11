const tfminiplus = require('../../')
const i2c = require('i2c-bus-promise') // NOT INCLUDED /W LIB - YOU MUST INSTALL!

i2c.open(1).then(async (bus) => {
  const tfmp = await tfminiplus.I2C(bus, 0x10)
  const measurements = await tfmp.measure()
  console.log('distance:', measurements.distance)
  console.log('strength:', measurements.strength)
  console.log('temperature:', measurements.temperature)
})
.catch(console.error)