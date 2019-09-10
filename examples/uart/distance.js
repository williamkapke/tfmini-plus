

// YOU MUST INSTALL @serialport/bindings
// IT IS ~NOT~ INCLUDED WITH THIS LIBRARY
// npm install @serialport/bindings

const tfminiplus = require('../../')
tfminiplus.UART('/dev/serial0', { baudRate: 115200 }).then(async (tfmp) => {
  const distance = await tfmp.distance()
  console.log('distance:', distance)
})
.catch(console.error)