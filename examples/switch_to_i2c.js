const tfminiplus = require('../')
tfminiplus.UART('/dev/serial0', { baudRate: 115200 }).then(async (tfmp) => {
  await tfmp.mode('i2c')
  await tfmp.save()
  console.log('done')
})
