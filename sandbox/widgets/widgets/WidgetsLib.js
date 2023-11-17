(function (global) {

    var document = global.document;

    function uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    if (!document.WidgetList || !document.WidgetList.Registry) {
        if (!document.WidgetList)  document.WidgetList = {}
        if (!document.WidgetList.Registry) document.WidgetList.Registry = []
        if (!document.WidgetList.Files) document.WidgetList.Files = []

        if (!document.WidgetList.init) document.WidgetList.init = 
            function() {
                for (let w of document.WidgetList.Registry) {
                    w.init();
                }
            }

        document.WidgetList.LoadWidget = function (widgetName, widgetPath) {

            // check list - if already loaded we can ignore
            if (document.WidgetList.Files[widgetPath]) {
                console.log(`Widget '${widgetName}' at '${widgetPath} already loaded`);
                // return 'empty' promise
                return new this.Promise(function (resolve, reject) {
                    resolve();
                });
            }
        
            return new Promise(function (resolve, reject) {
                // create JS library script element
                let script = document.createElement("script");
                script.src = widgetPath + '?r='+uuidv4();
                script.type = "text/javascript";
                console.log(`Widget '${widgetName}' at '${widgetPath} registered`);
        
                // flag as loading/loaded
                document.WidgetList.Files[widgetPath] = true;
        
                // if the script returns okay, return resolve
                script.onload = function () {
                    console.log(`Widget '${widgetName}' at '${widgetPath} loaded`);
                    resolve(widgetPath);
                };
        
                // if it fails, return reject
                script.onerror = function (e) {
                    console.log(`Widget '${widgetName}' at '${widgetPath} failed loading with message: ${e}`);
                    reject(widgetPath);
                }
        
                // scripts will load at end of body
                document["body"].appendChild(script);


            });
        }


    }

})(typeof window === "undefined" ? this : window);



