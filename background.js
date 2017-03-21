var dbName = 'todo';
function showNotification(storedData) {
    findAll(function(data){
      var todoList = data;
      todoList.forEach(function(toDo){
        for(var j = 0; j < toDo.subToDo.length; j++){
          chrome.notifications.create('reminder', {
            type: 'basic',
            iconUrl: 'icon.png',
            title: toDo.subToDo[j].name,
            message: "Due: " + toDo.subToDo[j].date + " " + toDo.subToDo[j].time
          }, function(notificationId) {});
        }
      });
    });
}

findAll = function(callback) {
    chrome.storage.sync.get('todo', function(keys) {
        //console.log(keys);
        if (keys.todo != null) {
            data = keys.todo;
            for (var i=0; i<data.length; i++) {
              data[i]['id'] = i + 1;
            }
            callback(data);
        }
    });
}


chrome.alarms.onAlarm.addListener(function( alarm ) {
	chrome.storage.local.get(dbName, showNotification);
});