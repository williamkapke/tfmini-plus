
// YOU MUST INSTALL @serialport/bindings
// IT IS ~NOT~ INCLUDED WITH THIS LIBRARY
// npm install @serialport/bindings

const tfminiplus = require('../../')
tfminiplus.UART('/dev/serial0', { baudRate: 115200 }).then(async (tfmp) => {
  const measurements = await tfmp.measure()
  console.log('distance:', measurements.distance)
  console.log('strength:', measurements.strength)
  console.log('temperature:', measurements.temperature)
})
.catch(console.error)