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

   function create1HourAlarm() {
    findAll(function(data){
      var todoList = data;
      for(var k = 0; k < todoList.length; k++){
        for(var j = 0; j < todoList[k].subToDo.length; j++){
          var subToDo = todoList[k].subToDo[j];
          var dueDate = new Date(subToDo.date);
          setTime(dueDate, subToDo.time);
          dueDate.setDate(dueDate.getDate() + 1);
          var nameOfAlarm = todoList[k].content + subToDo.name + "1Hour";
          if(dueDate.getTime() - 3.6e6 > Date.now()){
            chrome.alarms.create(nameOfAlarm, {when: dueDate.getTime() - 3.6e6});
          }
        }
      }
    });
   }

   function create1DayAlarm() {
    findAll(function(data){
      var todoList = data;
      for(var k = 0; k < todoList.length; k++){
        for(var j = 0; j < todoList[k].subToDo.length; j++){
          var subToDo = todoList[k].subToDo[j];
          var dueDate = new Date(subToDo.date);
          setTime(dueDate, subToDo.time);
          dueDate.setDate(dueDate.getDate() + 1);
          var nameOfAlarm = todoList[k].content + subToDo.name + "1Day";
          if(dueDate.getTime() - 8.64e7 > Date.now()){
            chrome.alarms.create(nameOfAlarm, {when: dueDate.getTime() - 8.64e7});
          }
        }
      }
    });
   }

  function create1WeekAlarm() {
    findAll(function(data){
      var todoList = data;
      for(var k = 0; k < todoList.length; k++){
        for(var j = 0; j < todoList[k].subToDo.length; j++){
          var subToDo = todoList[k].subToDo[j];
          var dueDate = new Date(subToDo.date);
          setTime(dueDate, subToDo.time);
          dueDate.setDate(dueDate.getDate() + 1);
          var nameOfAlarm = todoList[k].content + subToDo.name + "1Week";
          if(dueDate.getTime() - 6.048e8 > Date.now()){
            chrome.alarms.create(nameOfAlarm, {when: dueDate.getTime() - 6.048e8});
          }
        }
      }
    });
   }

   function createOverdueAlarm(){
    findAll(function(data){
      var todoList = data;
      for(var k = 0; k < todoList.length; k++){
        for(var j = 0; j < todoList[k].subToDo.length; j++){
          var subToDo = todoList[k].subToDo[j];
          var dueDate = new Date(subToDo.date);
          setTime(dueDate, subToDo.time);
          dueDate.setDate(dueDate.getDate() + 1);
          var nameOfAlarm = todoList[k].content + subToDo.name + "Overdue";
          if(dueDate.getTime() > Date.now()){
            chrome.alarms.create(nameOfAlarm, {when: dueDate.getTime()});
          }
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
         create1HourAlarm();
         create1DayAlarm();
         create1WeekAlarm();
         createOverdueAlarm();
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

setTime = function setDateTime(date, time) {
    var index = time.indexOf(":"); 

    var hours = time.substring(0, index);
    var minutes = time.substring(index + 1, time.length);

    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds("00");
    return date;
}