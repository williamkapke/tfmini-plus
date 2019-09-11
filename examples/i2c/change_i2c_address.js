const tfminiplus = require('../../')
const i2c = require('i2c-bus-promise') // NOT INCLUDED /W LIB - YOU MUST INSTALL!

i2c.open(1).then(async (bus) => {
  const tfmp = tfminiplus.I2C(bus, 0x10)
  await tfmp.address(0x12)
  await tfmp.save()
})
.catch(console.error)

//running this a second time will yield an error like:
// { [Error: EREMOTEIO: remote I/O error, write] errno: -121, code: 'EREMOTEIO', syscall: 'write' }

