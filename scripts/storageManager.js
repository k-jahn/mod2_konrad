// localStorage manager for JSON data
JSON.localStorageManager = function(url,callback,lifeSpan){
    lifeSpan = lifeSpan || 60*10*1000; // default 10min
    var storedData=localStorage.getItem(url) || false;
    var timeStamp = localStorage.getItem(url+'.timeStamp') || 0
    console.log(!timeStamp?(url+' not found in localStorage'):(url +' found in localStorage, lifeSpan remaining: ' + ((+timeStamp-Date.now()+lifeSpan)/60000).toFixed(2) + 'min'))
    if (+timeStamp<Date.now()-lifeSpan || !storedData) {
        $.getJSON(url, function(data) {
            console.log(url+' loaded from server, saving to localStorage')
            callback(data)
            // put in local storage
            localStorage.setItem(url,JSON.stringify(data))
            // timestamp
            localStorage.setItem(url+'.timeStamp',Date.now().toString())
        });
    } else {
    console.log(url+' loaded from localStorage')
        callback(JSON.parse(storedData))
    }
}