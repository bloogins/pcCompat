const entities = require('@vizality/entities');
const toProxy = require('../../toProxy');

class Plugin extends entities.Plugin {
    constructor (...props) {
        super(...props)
        this._isPcCompat = true
    }

    get entityID() { return this.addonId }

    loadStylesheet (...args) {
        return super.injectStyles(...args)
    }


    _load (...args) {
        this.__pcCompatPatchBefore()
        return super._load(...args)
    }
    _unload (...args) {
        this.__pcCompatPatchBefore()
        return super._unload(...args)
    }


    __pcCompatStart (...args) {
        this.__pcCompatPatchAfter()
        return this.startPlugin(...args)
    }
    
    __pcCompatStop (...args) {
        this.__pcCompatPatchAfter()
        return this.pluginWillUnload(...args)
    }
    
    __pcCompatPatchBefore () {
        this.__pcCompatOldStart = this.start
        this.__pcCompatOldStop = this.stop
        this.start = this.__pcCompatStart
        this.stop = this.__pcCompatStop
    }
    
    __pcCompatPatchAfter () {
        this.start = this.__pcCompatOldStart
        this.stop = this.__pcCompatOldStop
    }
}

module.exports = toProxy(entities, {
    Plugin
})
