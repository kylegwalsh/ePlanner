angular.module('app').service('todoStorage', function ($q, NotifyingService, NotifyingServiceCalendar, NotifyUndo ) {

    var _this = this;
    this.data = [];
    this.persistentInformation = [];
    this.UID;
    this.backUpToDo = [];
    this.extraBackupInfo;
    // Runs first time app opened
    $(document).ready(function(){
        if(_this.persistentInformation == null || _this.persistentInformation.UID == null || _this.persistentInformation.UID == ""){
            $('#MainPage').hide();
            $('#UIDPage').show();
        }
    });

    $('#UIDSubmit').bind('click', function(){
        _this.updateUID();
    });

    this.updateUID = function(){
        if(document.getElementById("UIDForm").value != ""){
            var temp = {
                topColor: 0,
                reminders: true,
                currentHash: 1,
                completedStuff: new Array(),
                notificationSound: "oldSpice.mp3",
                UID: document.getElementById("UIDForm").value
            }
            this.persistentInformation = temp;
            this.sync();
            $('#UIDPage').hide();        
            $('#MainPage').show();
        }
    }


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
        try{
            for (var i=0; i<this.data.length; i++) {
                _this.data[i]['id'] = i + 1; // TODO just i
            }
            this.sync();
        }
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.updateColor = function(color){
        try{
            var temp;
            if(this.persistentInformation.completedStuff != null){
                temp = this.persistentInformation.completedStuff;
            } else {
                temp = new Array();
            }

            var information = {
                topColor: color,
                reminders: this.persistentInformation.reminders,
                currentHash: this.persistentInformation.currentHash,
                completedStuff: temp,
                notificationSound: this.persistentInformation.notificationSound,
                UID: this.persistentInformation.UID            
            }
            this.persistentInformation = information;
            this.sync();
        }
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
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
            notificationSound: this.persistentInformation.notificationSound,
            UID: this.persistentInformation.UID 
        }
        this.persistentInformation = information;
        NotifyingService.notify(this.persistentInformation);

        var temp = new Array();

        if(_this.persistentInformation.completedStuff == null){

        } else {
            for(var i=0; i<_this.persistentInformation.completedStuff.length; i++){
                 temp.push(angular.copy(_this.persistentInformation.completedStuff[i]));
            }
        }
        this.extraBackupInfo = temp;

        this.sync();
    }

    this.restoreCompleted = function(backUpData){
        this.persistentInformation.completedStuff = backUpData;
        this.sync();
    }

    this.add = function (colorCode) {
        try{
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
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.changeCategoryName = function(index, newName){
        try{
            var size = _this.data.length; 
            var todo = _this.data[_this.data.length -index-1]; 
            var syncData;
            for (var i=0; i < todo.subToDo.length; i++) {
                syncData = {
                    functionName: "changeCategoryName",
                    data: todo.subToDo[i],
                    categoryName: newName
                }
                NotifyingServiceCalendar.notify(syncData);
            }

            todo.content = newName;
            this.sync();
            alarm.doToggleAlarms();
        }
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.changeCategoryColor = function(index, hexValue){
        try{
            var size = _this.data.length-1; 
            var todo = _this.data[size-index]; 
            var syncData;
            for (var i=0; i < todo.subToDo.length; i++) {
                syncData = {
                    functionName: "changeCategoryColor",
                    data: todo.subToDo[i],
                    categoryColor: hexValue
                }
                NotifyingServiceCalendar.notify(syncData);
            }

            todo.color = hexValue;
            this.sync();
        }
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.remove = function(index) {

        try{
            var category = _this.data[_this.data.length -index-1]; // _this.data.length -1 - index
            var syncData;
            for (var i=0; i < category.subToDo.length; i++) {
                alarm.cancelAlarms(category.subToDo[i]);
                syncData = {
                    functionName: "removeSubToDo",
                    data: category.subToDo[i]
                }
                NotifyingServiceCalendar.notify(syncData);
            }
            this.data.splice(_this.data.length -1 - index,1); // _this.data.length -1 - index,1
            this.updateIndexes();
            this.sync();
        }
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.removeCompleted = function(index){
        var extraInfo = _this.persistentInformation.completedStuff;
        extraInfo.splice(index,1);
        this.sync();
    }

    this.backupCompleteData = function(){
        var temp = new Array();

        if(_this.persistentInformation.completedStuff != null){
            for(var i=0; i<_this.persistentInformation.completedStuff.length; i++){
                 temp.push(angular.copy(_this.persistentInformation.completedStuff[i]));
            }
        }
        this.extraBackupInfo = temp;
    }

    this.backUp = function(catIndex, subIndex){
        var COPY = angular.copy(_this.data);
        this.backUpToDo = COPY;
     }

    this.clearSavedInfo = function(){
        var temp = new Array();
            for(var i=0; i<_this.persistentInformation.completedStuff.length; i++){
                 temp.push(angular.copy(_this.persistentInformation.completedStuff[i]));
        }

        this.extraBackupInfo = temp;
        this.backUpToDo = _this.data;
        this.sync();
    }

    this.restoreData = function(){
        _this.data = this.backUpToDo;
        _this.persistentInformation.completedStuff = this.extraBackupInfo;
        NotifyUndo.notify(this.extraBackupInfo); 
        this.sync();
    }

    this.removeSubToDo = function(categoryIndex, subToDoIndex){
        try{
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
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.changeSubToDoName = function(categoryIndex, subToDoIndex, name){

        try{
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
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.changeSubToDoNotes = function(categoryIndex, subToDoIndex, notes){
        try{
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
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.changeSubToDoDate = function(categoryIndex, subToDoIndex, date){
        try{
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
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.changeSubToDoTime = function(categoryIndex, subToDoIndex, time){
        try{
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
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.markToDoAsComplete = function(Categoryindex, subToDoIndex){
        try{
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
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
    }

    this.changeNotificationSound = function(selected){
        var information = {
            topColor: this.persistentInformation.topColor,
            reminders: this.persistentInformation.reminders,
            currentHash: this.persistentInformation.currentHash,
            completedStuff: this.persistentInformation.completedStuff, 
            notificationSound: selected,
            UID: this.persistentInformation.UID,
        }
        this.persistentInformation = information;
        this.sync();
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
        var information = {
            topColor: this.persistentInformation.topColor,
            reminders: info,
            currentHash: this.persistentInformation.currentHash,
            completedStuff: this.persistentInformation.completedStuff,  
            notificationSound: this.persistentInformation.notificationSound,
            UID: this.persistentInformation.UID 
        } 
        this.persistentInformation = information;
        this.sync();
    }

    this.addSubToDo = function(index, name, date, time, notes){
        try{
            // Assigns unique hash to todo
            var nextHash;
            var remindersTemp;
            var colorTemp;
            var completedTemp;
            var notificationTemp;
            var UIDTemp;

            remindersTemp = this.persistentInformation.reminders;
            colorTemp = this.persistentInformation.topColor;
            completedTemp = this.persistentInformation.completedStuff;
            notificationTemp = this.persistentInformation.notificationSound;
            UIDTemp = this.persistentInformation.UID;
            nextHash = this.persistentInformation.currentHash + 1;

            var information = {
                topColor: colorTemp,
                reminders: remindersTemp,
                currentHash: nextHash,
                completedStuff: completedTemp,
                notificationSound: notificationTemp,
                UID: UIDTemp
            } 
            this.persistentInformation = information;


            // Creates todo
            var size = _this.data.length-1; 
            var category = _this.data[size-index];

            var newData = {
                name: name,
                date: date,
                time: time,
                notes: notes,
                uniqueHash: nextHash,
            }
            category.subToDo.push(newData);      
            this.sync();
            var syncData = {
                functionName: "addSubToDo",
                data: newData,
                color: category.color,
                categoryName: category.content,
            }
            NotifyingServiceCalendar.notify(syncData);
        }
        catch(error){
            var errorBox = document.getElementById("ErrorBox");
            errorBox.style.display = "inline-block";
        }
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

        notify: function(importantInfo, evenMore, evenMore2) {
            $rootScope.$emit('notifying-service-color-event2', importantInfo, evenMore, evenMore2);
        }
    };
});

angular.module('app').factory('NotifyUndo', function($rootScope) {
    return {
        subscribe: function(scope, callback) {
            var handler = $rootScope.$on('notifying-service-undo', callback);
            scope.$on('$destroy', handler);
        },
        notify: function(data) {
            $rootScope.$emit('notifying-service-undo', data);
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