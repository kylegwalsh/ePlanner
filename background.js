var dbName = 'todo';
function showNotification(storedData) {
    findAll(function(data){
      // var todoList = data;
      // todoList.forEach(function(subToDo){
      //   for(j = 0; j < subToDo.length; j++){
      //     chrome.notifications.create('reminder', {
      //       type: 'basic',
      //       iconUrl: 'icon.png',
      //       title: todoList[0].content,
      //       message: 'You have things to do. Wake up, dude!'
      //     }, function(notificationId) {});
      //   }
      // });

          chrome.notifications.create('reminder', {
            type: 'basic',
            iconUrl: 'icon.png',
            title: todoList[0].content,
            message: 'You have things to do. Wake up, dude!'
          }, function(notificationId) {});
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

chrome.notifications.onClicked.addListener(function() {
  chrome.browserAction.enable();
});