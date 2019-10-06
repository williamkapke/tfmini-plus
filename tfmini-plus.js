const _debug = require('debug')
_debug.formatters.h = (v) => v.length ? Array.prototype.map.call(v, b => hex(b)).join(' ') : hex(v)
const debug = _debug('tfmini-plus')
const hex = (v) => v.toString(16).padStart(2, '0')
const sleep = (t) => new Promise((resolve) => setTimeout(resolve, t));

const sum = (buffer) => Array.prototype.reduce.call(buffer, (total, b) => total + b , 0) & 0x00FF // only the lower 8 bits
const checksum = (buffer) => {
  const check = buffer[buffer.length-1]
  buffer[buffer.length-1] = 0;

  if (sum(buffer) !== check) {
    console.log(buffer.toString('hex'))
    return Promise.reject(new Error('checksum failed'))
  }
  return buffer;
}

const TFMP = (write, read) => ({
  version: async () => {
    debug('version()')
    await write(Buffer.from([0x5A, 0x04, 0x01, 0x5F]))
    const buff = await read(7).then(checksum)
    return buff[5] + '.' + buff[4] + '.' + buff[3]
  },

  measure: async (unit = 'mm') => {
    debug('measure(%s)', unit)
    await write(unit === 'mm' ? TFMP.OBTAIN_DATA_FRAME_MM : TFMP.OBTAIN_DATA_FRAME_CM)
    const buff = await read(9).then(checksum)
    return {
      distance: buff[2] + (buff[3] << 8),
      strength: buff[4] + (buff[5] << 8),
      temperature: buff[6] + (buff[7] << 8)
    }
  },
  distance: async (unit = 'mm') => {
    debug('measure(%s)', unit)
    await write(unit === 'mm' ? TFMP.OBTAIN_DATA_FRAME_MM : TFMP.OBTAIN_DATA_FRAME_CM)
    const buff = await read(9).then(checksum)
    return buff[2] + (buff[3] << 8)
  },
  address: async (addr) => {
    debug('address(%h)', addr)
    const buff = Buffer.from([0x5A, 0x05, 0x0B, addr, 0x00])
    buff[4] = sum(buff)
    await write(buff)
  },
  save: async () => {
    debug('save()')
    await write(Buffer.from([0x5A, 0x04, 0x11, 0x6F]))
    await sleep(500)
    const buff = await read(5)
    if (buff[0] !== 0x5A || buff[3] !== 0x00) return Promise.reject(new Error('Failed to save settings'))
  },
  reset: async () => {
    debug('reset()')
    await write(Buffer.from([0x5A, 0x04, 0x02, 0x60]))
    const buff = await read(5)
    if (buff[0] !== 0x5A || buff[3] !== 0x00) return Promise.reject(new Error('System reset failed'))
  },
  restore: async () => {
    debug('restore()')
    await write(Buffer.from([0x5A, 0x04, 0x10, 0x6E]))
    const buff = await read(5)
    if (buff[0] !== 0x5A || buff[3] !== 0x00) return Promise.reject(new Error('System restore failed'))
  },
  mode: async (type='i2c') => {
    debug('mode(%s)',type)
    const buff = type.toLowerCase()==='i2c'
      ? Buffer.from([0x5A, 0x05, 0x0A, 0x01, 0x6A])
      : Buffer.from([0x5A, 0x05, 0x0A, 0x00, 0x69])
    buff[4] = sum(buff)
    await write(buff)
    // no response
  }
})

TFMP.OBTAIN_DATA_FRAME_CM = Buffer.from([0x5A, 0x05, 0x00, 0x01, 0x60])
TFMP.OBTAIN_DATA_FRAME_MM = Buffer.from([0x5A, 0x05, 0x00, 0x06, 0x65])

module.exports = {
  I2C: async (bus, address = 0x10, provider = 'i2c-bus') => {
    if (typeof bus !== 'object') {
      // need to open bus
      return require(provider).openPromisified(bus).then((bus) => module.exports.I2C(bus, address))
    }

    const write = async (data) => {
      debug('write [%h]', data)
      const addrChange = data[2] === 0x0B && data[1] === 0x05
      const response = await bus.i2cWrite(address, data.length, data)

      //special scenario...
      if (addrChange) {
        const prevAddr = address
        address = data[3]
        debug('changing address to [%h]', address)
        await sleep(500)
        const response = await read(5)
        if (response.compare(data) === 0) {
          debug('address changed to [%h]', address)
        }
        else {
          address = prevAddr
          return Promise.reject(new Error('Failed to change address.'))
        }
      }

      return response
    }

    const read = async (size) => {
      let response = await bus.i2cRead(address, size, Buffer.allocUnsafe(size))
      if (response.buffer) response = response.buffer // i2c-bus@^5 compatibility
      debug('i2c[0x%h] read(%s): [%h]', address, size, response)
      return response
    }

    await write(Buffer.from([0x5A, 0x06, 0x03, 0xE8, 0x03, 0x4E])) // set framerate to 1000
    return TFMP(write, read)
  },

  UART: async (path, options) => {

    const DefaultBindings = require('@serialport/bindings')
    const port = new DefaultBindings({})
    await port.open(path, options)

    const write = async (data) => {
      debug('write [%h]', data)
      await port.write(data)
      await port.drain()
    }

    const read = async (size) => {
      if (!port.isOpen) {
        debug('read: port is closed')
        return Promise.reject(new Error('attempt to read from closed port'))
      }
      const buff = Buffer.alloc(size)
      try {
        await port.read(buff, 0, size)
      }
      catch (e) {
        debug('error reading from serial', e)
        return Promise.reject(e)
      }

      debug('UART read(%s): [%h]', size, buff)
      return buff
    }

    // first thing- stop the stream of measurements...
    await write(Buffer.from([0x5A, 0x06, 0x03, 0x00, 0x00, 0x63])) // set framerate to 0
    // await port.drain()
    await port.flush()

    return TFMP(write, read)
  }
}