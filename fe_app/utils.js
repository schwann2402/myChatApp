function log(...args) { 
    for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        if (typeof arg === 'object') {
            arg = JSON.stringify(arg, null, 2);
        }
        console.log(arg);
    }
}

export default {log}