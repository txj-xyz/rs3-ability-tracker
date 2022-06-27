if (!success) throw new Error('Component "nav" not loaded due to success failure.')

log('Hello there')

ipc.on('opened', (event, param) => console.log(param))