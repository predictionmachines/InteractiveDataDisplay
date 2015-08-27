//
// (optional) onTaskCompleted: source x task -> unit 
InteractiveDataDisplay.SharedRenderWorker = function (scriptUri, onTaskCompleted) {
    var isWorkerAvailable = !!window.Worker;
    if (!isWorkerAvailable && window.console) console.log("Web workers are not available");
    var worker = isWorkerAvailable ? new Worker(scriptUri) : null;
    var isWorking = false;
    // Array of task source descriptors: { source, pendingTask, index /* in this array */ }
    var sources = [];

    var that = this;

    // Finds or creates, and then returns the source descriptor for the given task source object.
    var getSourceDescriptor = function (source, dontCreateIfNotExists) {
        var n = sources.length;
        for (var i = 0; i < n; i++) {
            if (sources[i].source == source) return sources[i];
        }
        if (dontCreateIfNotExists) return undefined;
        // Descriptor not found, adding new one:
        var descr = {
            source: source,
            pendingTask: undefined,
            index: n
        };
        sources.push(descr);
        return descr;
    };

    var getPendingDescriptor = function (completedDescr) {
        var n = sources.length;
        var iStart = 0;
        if (completedDescr) {
            iStart = completedDescr.index;
            for (var i = iStart + 1; i < n; i++)
                if (sources[i].pendingTask) return sources[i];
            for (var i = 0; i < iStart; i++)
                if (sources[i].pendingTask) return sources[i];
            if (sources[iStart].pendingTask) return sources[iStart];
        } else {
            for (var i = 0; i < n; i++)
                if (sources[i].pendingTask) return sources[i];
        }
        return undefined;
    };

    if (isWorkerAvailable) {
        worker.onmessage = function (event) {
            var task = event.data;
            var completedDescr = sources[task.sourceIndex];
            var pendingDescr = getPendingDescriptor(completedDescr);

            if (pendingDescr) {
                isWorking = true;
                worker.postMessage(pendingDescr.pendingTask);
                pendingDescr.pendingTask = undefined;
                //console.log("Starting render: " + pendingDescr.source.name);
            } else {
                isWorking = false;
            }

            //console.log("Complete render: " + completedDescr.source.name);
            if (onTaskCompleted)
                onTaskCompleted(completedDescr.source, task);
        };

        worker.onerror = function (event) {
            var str = event.message + " (" + event.filename + ":" + event.lineno + ")";
            if (typeof console === 'object')
                console.log(str);

            //todo: run next task
        };
    }

    ///////////// API ///////////////////////////////////////////

    this.enqueue = function (task, source) {
        var descr = getSourceDescriptor(source);
        task.sourceIndex = descr.index;
        //console.log("enqueue render: " + source.name);

        if (!isWorking) {
            isWorking = true;
            descr.pendingTask = undefined;

            worker.postMessage(task);
            //console.log("Starting render: " + source.name);
        }
        else {
            descr.pendingTask = task;
        }
    };

    // Cancels the pending task for the given source.
    this.cancelPending = function (source) {
        var descr = getSourceDescriptor(source, true);
        if (descr)
            descr.pendingTask = undefined;
    };


    if (!isWorkerAvailable) {
        this.enqueue = function (task, source) {
        };

        this.cancelPending = function (source) {
        };
    }
}
