angular.module('app').service('todoStorage', function ($q, NotifyingService, NotifyingServiceCalendar ) {

    var _this = this;
    this.data = [];
    this.persistentInformation = [];

    this.findAll = function(callback) {
        chrome.storage.sync.get('todo', function(keys) {
            if (keys.todo != null) {
                _this.data = keys.todo;
                for (var i=0; i<_this.data.length; i++) {
                    _this.data[i]['id'] = i + 1;
                }
                callback(_this.data);
            }
        });
    }

    this.findAll2 = function(callback){   
        chrome.storage.sync.get('info', function(keys){    
            _this.persistentInformation = keys.info;
            callback(_this.persistentInformation);
        });
    }

    this.updateIndexes = function(){
        for (var i=0; i<_this.data.length; i++) {
            _this.data[i]['id'] = i + 1;
        }
        this.sync();
    }

    this.updateColor = function(color){

        var temp;
        if(this.persistentInformation.completedStuff != null){
            temp = this.persistentInformation.completedStuff;
        } else {
            temp = new Array();
        }

        var information = {
            topColor: color,
            currentHash: this.persistentInformation.currentHash,
            completedStuff: temp,    
        }
        this.persistentInformation = information;
        console.log(this.persistentInformation);
        this.sync();
    }

    this.sync = function() {
        chrome.storage.sync.set({todo: this.data}, function() {});
        chrome.storage.sync.set({info: this.persistentInformation}, function() {});
    }

    this.removeAllCompleted = function(){
        var temp = this.persistentInformation.reminders;
        if(temp == null){
            temp = true;
        }

        var information = {
            topColor: this.persistentInformation.topColor,
            reminders: temp,
            currentHash: this.persistentInformation.currentHash,
            completedStuff: new Array(),    
        }
        this.persistentInformation = information;
        NotifyingService.notify(this.persistentInformation);
        this.sync();
    }


    this.add = function (colorCode) {
        var id = this.data.length;      

        var todo = {
            id: id,
            content: "",
            completed: false,
            color: colorCode, // default color
            createdAt: new Date(),
            subToDo: new Array(0), // array to keep track of the subToDos
        };
        this.data.push(todo); // adds new category to the end of the array
        this.sync();
        return id;
    }

    this.changeCategoryName = function(index, newName){
        var todo = _this.data[index];
        var old = todo.content;
        todo.content = newName;
        this.sync();
        alarm.doToggleAlarms();

        var syncData = {
            functionName: "changeCategoryName",
            oldCategoryName: old,
            newCategoryName: newName
        }
        NotifyingServiceCalendar.notify(syncData);
    }

    this.changeCategoryColor = function(index, hexValue){
        var todo = _this.data[index];
        todo.color = hexValue;
        this.sync();
        var syncData = {
            functionName: "changeCategoryColor",
            categoryName: todo.content,
            categoryColor: hexValue
        }
        NotifyingServiceCalendar.notify(syncData);
    }

    this.remove = function(index) {
        var category = _this.data[index];
        for (var i=0; i < category.subToDo.length; i++) {
            alarm.cancelAlarms(category.subToDo[i]);
        }

        var category = this.data[index].content;
        this.data.splice(index, 1);
        this.updateIndexes();
        this.sync();
        var syncData = {
            functionName: "remove",
            category: category
        }
        NotifyingServiceCalendar.notify(syncData);
    }

    this.removeCompleted = function(index){
        var extraInfo = _this.persistentInformation.completedStuff;
        extraInfo.splice(index,1);
        this.sync();
    }

    this.removeSubToDo = function(categoryIndex, subToDoIndex){
        var size = _this.data.length-1; 
        var category = _this.data[size-categoryIndex]; // we have to go backwards essentially since on the DOM they are displayed backwards (newest first)
        var size2 = category.subToDo.length-1;
        alarm.cancelAlarms(category.subToDo[size2 - subToDoIndex]);
        var removeData = category.subToDo[category.subToDo.length-1-subToDoIndex];
        category.subToDo.splice(category.subToDo.length-1-subToDoIndex, 1);
        this.sync();
        var syncData = {
            functionName: "removeSubToDo",
            data: removeData
        }
        NotifyingServiceCalendar.notify(syncData);
    }

    this.changeSubToDoName = function(categoryIndex, subToDoIndex, name){
        var size = _this.data.length-1; 
        var category = _this.data[size-categoryIndex];
        var size2 = category.subToDo.length-1;

        var newData = {
            name: name,
            date: category.subToDo[size2 - subToDoIndex].date,
            time: category.subToDo[size2 - subToDoIndex].time,
            notes: category.subToDo[size2 - subToDoIndex].notes,
            uniqueHash: category.subToDo[size2 - subToDoIndex].uniqueHash
        }
        category.subToDo[size2 - subToDoIndex] = newData;
        this.sync();
        alarm.doToggleAlarms();

        var syncData = {
            functionName: "changeSubToDoName",
            data: newData
        }
        NotifyingServiceCalendar.notify(syncData);
    }

    this.changeSubToDoNotes = function(categoryIndex, subToDoIndex, notes){
        var size = _this.data.length-1; 
        var category = _this.data[size-categoryIndex];
        var size2 = category.subToDo.length-1;

        var newData = {
            name: category.subToDo[size2 - subToDoIndex].name,
            date: category.subToDo[size2 - subToDoIndex].date,
            time: category.subToDo[size2 - subToDoIndex].time,
            notes: notes,
            uniqueHash: category.subToDo[size2 - subToDoIndex].uniqueHash
        }
        category.subToDo[size2 - subToDoIndex] = newData;
        this.sync();
        var syncData = {
            functionName: "changeSubToDoNotes",
            data: newData
        }
        NotifyingServiceCalendar.notify(syncData);
    }

    this.changeSubToDoDate = function(categoryIndex, subToDoIndex, date){
        var size = _this.data.length-1; 
        var category = _this.data[size-categoryIndex];
        var size2 = category.subToDo.length-1;

        var newData = {
            name: category.subToDo[size2 - subToDoIndex].name,
            date: date,
            time: category.subToDo[size2 - subToDoIndex].time,
            notes: category.subToDo[size2 - subToDoIndex].notes,
            uniqueHash: category.subToDo[size2 - subToDoIndex].uniqueHash
        } 
        category.subToDo[size2 - subToDoIndex] = newData;
        this.sync();
        alarm.cancelAlarms(category.subToDo[size2 - subToDoIndex]);
        alarm.doToggleAlarms();

        var syncData = {
            functionName: "changeSubToDoDate",
            data: newData
        }
        NotifyingServiceCalendar.notify(syncData);
    }

    this.changeSubToDoTime = function(categoryIndex, subToDoIndex, time){
        var size = _this.data.length-1; 
        var category = _this.data[size-categoryIndex];
        var size2 = category.subToDo.length-1;

        var newData = {
            name: category.subToDo[size2 - subToDoIndex].name,
            date: category.subToDo[size2 - subToDoIndex].date,
            time: time,
            notes: category.subToDo[size2 - subToDoIndex].notes,
            uniqueHash: category.subToDo[size2 - subToDoIndex].uniqueHash
        }
        category.subToDo[size2 - subToDoIndex] = newData;
        this.sync();
        alarm.cancelAlarms(category.subToDo[size2 - subToDoIndex]);
        alarm.doToggleAlarms();

        var syncData = {
            functionName: "changeSubToDoTime",
            data: newData
        }
        NotifyingServiceCalendar.notify(syncData);
    }

    this.markToDoAsComplete = function(Categoryindex, subToDoIndex){

        var size = _this.data.length-1; 
        var categoryX = _this.data[size-Categoryindex];
        var current = categoryX.subToDo[categoryX.subToDo.length-1-subToDoIndex];
        if(current.name == "" && current.notes == ""){
            // nothing, don't add
        } else {
            var completedObject = {
            category: categoryX.content,
            name: current.name,
            date: current.date,
            time: current.time, 
            notes: current.notes, 
            completedAt: new Date(), // each new date gets set to creation time
            }
            if(this.persistentInformation.completedStuff != null){
                this.persistentInformation.completedStuff.push(completedObject);
            } else {
                this.persistentInformation.completedStuff = new Array();
                this.persistentInformation.completedStuff.push(completedObject);
            } 
            this.sync();
            NotifyingService.notify(this.persistentInformation); // used to notify completed controller of any changes
        }

    }

    this.modifySubToDo = function(categoryIndex, subToDoIndex, name, date, time, notes){
        var size = _this.data.length-1; 
        var category = _this.data[size-categoryIndex];
        var size2 = category.subToDo.length-1;

        var newData = {
            name: name,
            date: date,
            time: time,
            notes: notes,
            uniqueHash: category.subToDo[size2 - subToDoIndex].uniqueHash
        }    
        category.subToDo[size2 - subToDoIndex] = newData;
        this.sync();
        alarm.cancelAlarms(category.subToDo[size2 - subToDoIndex]);
        alarm.doToggleAlarms();

        NotifyingServiceCalendar.notify(this.data);
    }

    this.changeReminderSetting = function(){
        // toggle so we dont' need any input
        var info = this.persistentInformation.reminders;
        if(info == undefined){
            info = true;
        } else if(info == true){
            info = false;
        } else {
            info = true;
        }
        console.log(info);
        var information = {
            topColor: this.persistentInformation.topColor,
            reminders: info,
            currentHash: this.persistentInformation.currentHash,
            completedStuff: this.persistentInformation.completedStuff,   
        } 
        this.persistentInformation = information;
        this.sync();
        console.log("AFTER");
        console.log(this.persistentInformation);
    }

    this.addSubToDo = function(index, name, date, time, notes){
        // Assigns unique hash to todo
        var nextHash;
        // Set current hash to one if it hasn't been intialized
        if(this.persistentInformation.currentHash == null){
            nextHash = 1;
        }
        // Otherwise, increment it
        else{
            var temp;
            nextHash = this.persistentInformation.currentHash + 1;
            if(this.persistentInformation.completedStuff != null){
                temp = this.persistentInformation.completedStuff;
            } else {
                temp = new Array();
            }
        }

        var temp = this.persistentInformation.reminders;
        if(temp == null){
            temp = true;
        }

        var information = {
            topColor: this.persistentInformation.topColor,
            reminders: temp,
            currentHash: nextHash,
            completedStuff: this.persistentInformation.completedStuff,    
        } 
        this.persistentInformation = information;

        // Creates todo
        var category =  _this.data[index];
        if(category == ""){
            category = _this.data[index-1]; 
        }

        var newData = {
            name: name,
            date: date,
            time: time,
            notes: notes,
            uniqueHash: nextHash,
        }
        console.log(nextHash);
        category.subToDo.push(newData);       
        this.sync();
        var syncData = {
            functionName: "addSubToDo",
            data: newData,
            color: category.color
        }
        NotifyingServiceCalendar.notify(syncData);
    }
});

// Used to notify the complete controller when something in the main controller has been marked as complete 
angular.module('app').factory('NotifyingService', function($rootScope) {
    return {
        subscribe: function(scope, callback) {
            var handler = $rootScope.$on('notifying-service-event', callback);
            scope.$on('$destroy', handler);
        },

        notify: function(importantInfo) {
            $rootScope.$emit('notifying-service-event', importantInfo);
        }
    };
});

angular.module('app').factory('NotifyingColorService', function($rootScope) {
    return {
        subscribe: function(scope, callback) {
            var handler = $rootScope.$on('notifying-service-color-event', callback);
            scope.$on('$destroy', handler);
        },

        notify: function(importantInfo) {
            $rootScope.$emit('notifying-service-color-event', importantInfo);
        }
    };
});

angular.module('app').factory('NotifyingColorService2', function($rootScope) {
    return {
        subscribe: function(scope, callback) {
            var handler = $rootScope.$on('notifying-service-color-event2', callback);
            scope.$on('$destroy', handler);
        },

        notify: function(importantInfo, evenMore) {
            $rootScope.$emit('notifying-service-color-event2', importantInfo, evenMore);
        }
    };
});


angular.module('app').factory('NotifyingServiceCalendar', function($rootScope) {
    return {
        subscribe: function(scope, callback) {
            var handler = $rootScope.$on('notifying-service-calendar-event', callback);
            scope.$on('$destroy', handler);
        },

        notify: function(importantInfo) {
            $rootScope.$emit('notifying-service-calendar-event', importantInfo);
        }
    };
});