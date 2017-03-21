angular.module('app').service('todoStorage', function ($q, NotifyingService) {

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
                console.log("FINDALL:")
                console.log(_this.data);
                callback(_this.data);
            }
        });
    }

    this.findAll2 = function(callback){   
        chrome.storage.sync.get('info', function(keys){    
            _this.persistentInformation = keys.info;
            console.log("FINDALL2:")
            console.log(_this.persistentInformation);
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
            completedStuff: temp,    
        }
        this.persistentInformation = information;
        this.sync();
    }

    this.sync = function() {
        chrome.storage.sync.set({todo: this.data}, function() {});
        chrome.storage.sync.set({info: this.persistentInformation}, function() {});
    }

    this.removeAllCompleted = function(){
        var information = {
            topColor: this.persistentInformation.topColor,
            completedStuff: new Array(),    
        }
        this.persistentInformation = information;
        NotifyingService.notify(this.persistentInformation);
        this.sync();
    }

    this.add = function () {
        var id = this.data.length;
        var todo = {
            id: id,
            content: "",
            completed: false,
            color: "F5B041", // default color
            createdAt: new Date(),
            subToDo: new Array(0), // array to keep track of the subToDos
            uniqueHash: _this.persistentInformation.currentHash,
        };
        console.log(_this.persistentInformation.currentHash);
        _this.persistentInformation.currentHash++;
        this.data.push(todo); // adds new category to the end of the array
        this.sync();
        return id;
    }

    this.changeCategoryName = function(index, newName){
        var todo = _this.data[index];
        todo.content = newName;
        this.sync();
    }

    this.changeCategoryColor = function(index, hexValue){
        var todo = _this.data[index];
        todo.color = hexValue;
        this.sync();
    }

    this.remove = function(index) {
        this.data.splice(index, 1);
        this.updateIndexes();
        this.sync();
    }

    this.removeCompleted = function(index){
        var extraInfo = _this.persistentInformation.completedStuff;
        extraInfo.splice(index,1);
        this.sync();
    }

    this.removeSubToDo = function(categoryIndex, subToDoIndex){
        var size = _this.data.length-1; 
        var category = _this.data[size-categoryIndex]; // we have to go backwards essentially since on the DOM they are displayed backwards (newest first)
        category.subToDo.splice(category.subToDo.length-1-subToDoIndex, 1);
        this.sync();
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
        }
        category.subToDo[size2 - subToDoIndex] = newData;
        this.sync();
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
        }
        category.subToDo[size2 - subToDoIndex] = newData;
        this.sync();
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
        } 
        category.subToDo[size2 - subToDoIndex] = newData;
        this.sync();
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
        }
        category.subToDo[size2 - subToDoIndex] = newData;
        this.sync();
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
        }    
        category.subToDo[size2 - subToDoIndex] = newData;
        this.sync();
    }

    this.addSubToDo = function(index, name, date, time, notes){
        var category =  _this.data[index];
        if(category == undefined){
            category = _this.data[index-1]; 
        }

        var newData = {
            name: name,
            date: date,
            time: time,
            notes: notes,
        }        
        category.subToDo.push(newData);       
        this.sync();
    }

    this.removeAll = function() {
        this.data = [];
        this.sync();
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