# default usage

let mmd = new MetaMaskDecorator();

mmd.$when('isInstalled', false).then(() => {
    alert('Please install MetaMask chrome extension and refresh this page');
});

mmd.$when('isUserSignedIn', false).then(() => {
    alert('Please select ETH account in MetaMask');
});

mmd.$when('isFullyReady').then(() => {
    // code to show web UI
});

# options

debug: Boolean
refreshRate: Integer (milliseconds)

Example: new MetaMaskDecorator({refreshRate: 10000, debug: true})

# props

state : Object
state.isInstalled : Boolean
state.networkId : Integer|null
state.networkName : String|null
state.isNetworkReady : Boolean
state.userAddress : String|null
state.isUserSignedIn : Boolean
state.isFullyReady : Boolean

# events

let MetaMaskDecoratorEvents = {
  META_MASK_INSTALLED: 'META_MASK_INSTALLED',
  META_MASK_UNINSTALLED: 'META_MASK_UNINSTALLED',
  NETWORK_LOADING: 'NETWORK_LOADING',
  NETWORK_READY: 'NETWORK_READY',
  USER_CHANGED: 'USER_CHANGED',
  USER_SIGNED_IN: 'USER_SIGNED_IN',
  FULLY_READY: 'FULLY_READY',
  NOT_FULLY_READY: 'NOT_FULLY_READY',
};

# methods

$on(eventName, callback);
$when(stateProperty, expectedValue) : Promise;

