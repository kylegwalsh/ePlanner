(function () {
  'use strict';
   var alarmName = 'remindme';
   function checkAlarm(callback) {

     chrome.alarms.getAll(function(alarms) {
       var hasAlarm = alarms.some(function(a) {
         return a.name == alarmName;
       });
       var newLabel;
       if (hasAlarm) {
         newLabel = 'Cancel alarm';
       } else {
         newLabel = 'Activate alarm';
       }
       document.getElementById('toggleAlarm').innerText = newLabel;
       if (callback) callback(hasAlarm);
     })
   }

   function createAlarm() {
    findAll(function(data){
      var todoList = data;
            console.log("TODOLIST____________________");
      console.log(todoList);
      for(var k = 0; k < todoList.length; k++){
        console.log("TODOLIST.SUBTODO____________________");
        console.log(todoList[k].subToDo);
        for(var j = 0; j < todoList[k].subToDo.length; j++){
          console.log("SUBTODO____________________");
          console.log(todoList);
          chrome.alarms.create(todoList[k].subToDo[j].name, {when: Date.now() + 60000});
        }
      }
    });
   }
   function cancelAlarm() {
     chrome.alarms.clear(alarmName);
   }
   function doToggleAlarm() {
     checkAlarm( function(hasAlarm) {
       if (hasAlarm) {
         cancelAlarm();
       } else {
         createAlarm();
       }
       checkAlarm();
     });
   }
  $('#toggleAlarm').bind('click', doToggleAlarm);
  checkAlarm();
})();

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