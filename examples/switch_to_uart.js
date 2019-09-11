const tfminiplus = require('../')
const i2c = require('i2c-bus-promise') // NOT INCLUDED /W LIB - YOU MUST INSTALL!

i2c.open(1).then(async (bus) => {
  const tfmp = await tfminiplus.I2C(bus, 0x10)
  await tfmp.mode('uart')
  await tfmp.save()
})

//this will end with an error.. cause we change protocols
