type ReadyListener = () => void;

type Context = {
    readyListeners: ReadyListener[];
    isReady: boolean;
};

const globalContext: Context = {
    readyListeners: [],
    isReady: false,
};

function init(context: Context = globalContext): Context {
    if (!context) {
        context = {
            readyListeners: [],
            isReady: false,
        };
    }

    document.addEventListener('deviceready', () => {
        context.isReady = true;
        context.readyListeners.forEach(cb => cb());
    }, false);

    return context;
}

function onReady(cb: ReadyListener, context: Context = globalContext): void {
    if (context.isReady) {
        cb();
    } else {
        context.readyListeners.push(cb);
    }
}

init(globalContext);

export default {
    onReady,
};
