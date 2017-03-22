var alarm = (function () {
  'use strict';
   return {

   create1HourAlarm: (function () {
    findAll(function(data){
      var todoList = data;
      for(var k = 0; k < todoList.length; k++){
        for(var j = 0; j < todoList[k].subToDo.length; j++){
          var subToDo = todoList[k].subToDo[j];
          if(subToDo.date == ""){
            return;
          }
          var dueDate = new Date(subToDo.date);
          var time = subToDo.time;
          if(time == ""){
            time = "12:00";
          }
          setTime(dueDate, time);
          dueDate.setDate(dueDate.getDate() + 1);
          var nameOfAlarm = subToDo.uniqueHash + "1Hour";
          if(dueDate.getTime() - 3.6e6 > Date.now()){
            chrome.alarms.create(nameOfAlarm, {when: dueDate.getTime() - 3.6e6});
          }
        }
      }
    });
   }),

   create1DayAlarm: (function () {
    findAll(function(data){
      var todoList = data;
      for(var k = 0; k < todoList.length; k++){
        for(var j = 0; j < todoList[k].subToDo.length; j++){
          var subToDo = todoList[k].subToDo[j];
          if(subToDo.date == ""){
            return;
          }
          var dueDate = new Date(subToDo.date);
          var time = subToDo.time;
          if(time == ""){
            time = "12:00";
          }
          setTime(dueDate, time);
          dueDate.setDate(dueDate.getDate() + 1);
          var nameOfAlarm = subToDo.uniqueHash + "1Day";
          if(dueDate.getTime() - 8.64e7 > Date.now()){
            chrome.alarms.create(nameOfAlarm, {when: dueDate.getTime() - 8.64e7});
          }
        }
      }
    });
   }),

  create1WeekAlarm: (function () {
    findAll(function(data){
      console.log("Creating alarms");
      var todoList = data;
      for(var k = 0; k < todoList.length; k++){
        for(var j = 0; j < todoList[k].subToDo.length; j++){
          var subToDo = todoList[k].subToDo[j];
          if(subToDo.date == ""){
            return;
          }
          var dueDate = new Date(subToDo.date);
          var time = subToDo.time;
          if(time == ""){
            time = "12:00";
          }
          setTime(dueDate, time);
          dueDate.setDate(dueDate.getDate() + 1);
          var nameOfAlarm = subToDo.uniqueHash + "1Week";
          if(dueDate.getTime() - 6.048e8 > Date.now()){
            chrome.alarms.create(nameOfAlarm, {when: dueDate.getTime() - 6.048e8});
          }
        }
      }
    });
   }),

   createOverdueAlarm: (function (){
    findAll(function(data){
      var todoList = data;
      for(var k = 0; k < todoList.length; k++){
        for(var j = 0; j < todoList[k].subToDo.length; j++){
          var subToDo = todoList[k].subToDo[j];
          if(subToDo.date == ""){
            continue;
          }
          var dueDate = new Date(subToDo.date);
          var time = subToDo.time;
          if(time == ""){
            time = "12:00";
          }
          setTime(dueDate, time);
          dueDate.setDate(dueDate.getDate() + 1);
          var nameOfAlarm = subToDo.uniqueHash + "Overdue";
          if(dueDate.getTime() > Date.now()){
            chrome.alarms.create(nameOfAlarm, {when: dueDate.getTime()});
          }
        }
      }
    });
   }),

   cancelAlarms: (function(subToDo) {
     chrome.alarms.clear(subToDo.uniqueHash + "1Hour");
     chrome.alarms.clear(subToDo.uniqueHash + "1Day");
     chrome.alarms.clear(subToDo.uniqueHash + "1Week");
     chrome.alarms.clear(subToDo.uniqueHash + "Overdue");
     console.log("Alarm canceled for subToDo Hash: " + subToDo.uniqueHash);
   }),

   doToggleAlarms: (function () {
       alarm.create1HourAlarm();
       alarm.create1DayAlarm();
       alarm.create1WeekAlarm();
       alarm.createOverdueAlarm();
   })

  };
})();

findAll = function(callback) {
    chrome.storage.sync.get('todo', function(keys) {
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