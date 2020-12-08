const { patch, unpatch } = require('@vizality/patcher')

module.exports = { inject: (...args) => {
  patch(...args)
  args[1][`__powercordOriginal_${args[2]}`] = args[1][`__vizalityOriginal_${args[2]}`]
}, uninject: unpatch
}

