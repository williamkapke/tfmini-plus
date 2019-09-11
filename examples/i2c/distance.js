const tfminiplus = require('../../')
const i2c = require('i2c-bus-promise') // NOT INCLUDED /W LIB - YOU MUST INSTALL!

i2c.open(1).then(async (bus) => {
  const tfmp = await tfminiplus.I2C(bus, 0x10)
  const distance = await tfmp.distance()
  console.log('distance:', distance)
})
.catch(console.error)
