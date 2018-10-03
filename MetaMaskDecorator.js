let MetaMaskDecoratorEvents = {
  META_MASK_INSTALLED: 'META_MASK_INSTALLED',
  META_MASK_UNINSTALLED: 'META_MASK_UNINSTALLED',
  NETWORK_LOADING: 'NETWORK_LOADING',
  NETWORK_READY: 'NETWORK_READY',
  // NETWORK_CHANGED: 'NETWORK_CHANGED',
  USER_CHANGED: 'USER_CHANGED',
  USER_SIGNED_IN: 'USER_SIGNED_IN',
  FULLY_READY: 'FULLY_READY',
  NOT_FULLY_READY: 'NOT_FULLY_READY',
};

class MetaMaskDecorator {
  constructor ({refreshRate = 1000, debug = false} = {}) {
    this.callbacks = {};
    this.debug = debug;

    this.web3 = null;
    
    this.state = {
      isInstalled: null,
      networkId: null,
      networkName: null,
      isNetworkReady: null,
      userAddress: null,
      isUserSignedIn: null,
      isFullyReady: null,
    };

    this.updateStateInterval = setInterval(() => {
      this.updateState();
      this.debug && console.log('updateState', this.state);
    }, refreshRate);
  }

  // getters

  // events
  $on(name, callback) {
    this.callbacks[name] = this.callbacks[name] || [];
    this.callbacks[name].push(callback);
  }

  $emit(name, data) {
    this.debug && console.log('emit', name, data);
    if (!this.callbacks[name]) {
      return;
    }
    for (let i in this.callbacks[name]) {
      this.callbacks[name][i](data);
    }
  }

  $when(key, value = true) {
    let _this = this;
    function isTime() {
      return _this.state[key] === value;
    }

    return new Promise((resolve, reject) => {
      if (isTime()) {
        resolve();
        return;
      }
      let interval = setInterval(() => {
        if (isTime()) {
          resolve();
          clearInterval(interval);
        }
      }, 30);
    });
  }

  // private
  updateState() {
    // web3
    if (window.Web3 && window.web3) {
      this.web3 = this.web3 || new window.Web3(window.web3.currentProvider);
    } else {
      this.web3 = null;
    }
    let isInstalled = !!this.web3;
    if (isInstalled !== this.state.isInstalled) {
      let event = isInstalled ? MetaMaskDecoratorEvents.META_MASK_INSTALLED : MetaMaskDecoratorEvents.META_MASK_UNINSTALLED;
      this.$emit(event);
    }
    this.state.isInstalled = isInstalled;

    // network
    let web3 = this.web3;
    if (
      web3 &&
      web3.currentProvider &&
      web3.currentProvider.publicConfigStore &&
      web3.currentProvider.publicConfigStore._state &&
      web3.currentProvider.publicConfigStore._state.networkVersion
    ) {
      const networkNames = {
        1: 'Main',
        4: 'Rinkeby',
        5777: 'Development'
      };
      let networkId = web3.currentProvider.publicConfigStore._state.networkVersion;
      if (networkId !== this.state.networkId) {
        // this.$emit(MetaMaskDecoratorEvents.NETWORK_CHANGED, {from: this.state.networkId, to: networkId});
        this.state.networkName = networkNames[networkId] || `Network #${networkId}`;
        this.state.networkId = networkId;

        let isNetworkReady = this.state.networkId !== 'loading';
        if (isNetworkReady !== this.state.isNetworkReady) {
          let event = isNetworkReady ? MetaMaskDecoratorEvents.NETWORK_READY : MetaMaskDecoratorEvents.NETWORK_LOADING;
          this.$emit(event, this.state.networkId);
        }
        this.state.isNetworkReady = isNetworkReady;
      }
    }

    // user
    let address = web3 ? web3.eth.accounts[0] : null;
    if (this.state.userAddress !== address) {
      this.$emit(MetaMaskDecoratorEvents.USER_CHANGED, {from: this.state.userAddress, to: address});

      if (address) {
        this.$emit(MetaMaskDecoratorEvents.USER_SIGNED_IN, address);
      }

      this.state.userAddress = address;
      this.state.isUserSignedIn = !!this.state.userAddress;
    }

    // isFullyReady ?
    let isFullyReady = this.state.isInstalled && this.state.isNetworkReady && this.state.isUserSignedIn;
    if (this.state.isFullyReady !== isFullyReady) {
      let event = isFullyReady ? MetaMaskDecoratorEvents.FULLY_READY : MetaMaskDecoratorEvents.NOT_FULLY_READY;
      this.$emit(event);
    }
    this.state.isFullyReady = isFullyReady;
  }
}

export default MetaMaskDecorator;
export {MetaMaskDecorator, MetaMaskDecoratorEvents}