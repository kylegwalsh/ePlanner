var dbName = 'todo';
function showNotification(alarm) {
    findAll(function(data){
      var todoList = data;
      todoList.forEach(function(toDo){
        for(var j = 0; j < toDo.subToDo.length; j++){
          if(alarm.name == toDo.content + toDo.subToDo[j].name + "1Hour" || alarm.name == toDo.content + toDo.subToDo[j].name + "1Day" || alarm.name == toDo.content + toDo.subToDo[j].name + "1Week"){
            var notificationDate = new Date(toDo.subToDo[j].date);
            setTime(notificationDate, toDo.subToDo[j].time);
            chrome.notifications.create(alarm.name, {
              type: 'basic',
              iconUrl: 'icon.png',
              title: toDo.content,
              message: toDo.subToDo[j].name + "\nDue: " + formatDate(notificationDate)
            }, function(notificationId) {});
          }
          else if(alarm.name == toDo.content + toDo.subToDo[j].name + "Overdue"){
            var notificationDate = new Date(toDo.subToDo[j].date);
            setTime(notificationDate, toDo.subToDo[j].time);
            chrome.browserAction.setBadgeText({text: "!"});
            chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});
            chrome.notifications.create(alarm.name, {
              type: 'basic',
              iconUrl: 'icon.png',
              title: toDo.content,
              message: toDo.subToDo[j].name + "\nThis assignment is now overdue!"
            }, function(notificationId) {});
          }
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
  console.log(alarm);
  showNotification(alarm);
  chrome.alarms.clear(alarm.name);
});

setTime = function setDateTime(date, time) {
    var index = time.indexOf(":"); 

    var hours = time.substring(0, index);
    var minutes = time.substring(index + 1, time.length);

    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds("00");
    return date;
}

function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}