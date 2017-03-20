angular.module('app').service('todoStorage', function ($q) {

    var _this = this;
    this.data = [];
    this.persistentInformation = [];

    this.findAll = function(callback) {
        chrome.storage.sync.get('todo', function(keys) {
            console.log(keys);
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

    this.sync = function() {
        chrome.storage.sync.set({todo: this.data}, function() {});
        chrome.storage.sync.set({info: this.persistentInformation}, function() {
            
        });
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
        };
        console.log("New category at index: " + id);
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
        console.log("(Storage) Category Index " + index + " color changed to: " + todo.color);
        this.sync();
    }

    this.remove = function(index) {
        this.data.splice(index, 1);
        this.updateIndexes();
        this.sync();
    }

    this.removeSubToDo = function(Categoryindex, subToDoIndex){
        var size = _this.data.length-1; 
        var category = _this.data[size-Categoryindex]; // we have to go backwards essentially since on the DOM they are displayed backwards (newest first)
        category.subToDo.splice(category.subToDo.length-1-subToDoIndex, 1);
        this.sync();
    }

    this.updateColor = function(color){

        var information = {
            topColor: color,    

        }

        this.persistentInformation = information;
        this.sync()
    }

    this.changeSubToDoName = function(Categoryindex, subToDoIndex, name){
        var size = _this.data.length-1; 
        var category = _this.data[size-Categoryindex];
        var size2 = category.subToDo.length-1;

        var newData = {
            name: name,
            date: category.subToDo[size2 - subToDoIndex].date,
            time: category.subToDo[size2 - subToDoIndex].time,
            notes: category.subToDo[size2 - subToDoIndex].notes,
        }
        console.log("Passed in name: " + name + ", Stored name : " + newData.name);
        category.subToDo[size2 - subToDoIndex] = newData;
        console.log("Updated name: " + category.subToDo[size2 - subToDoIndex].name);
        this.sync();
    }

    this.modifySubToDo = function(Categoryindex, subToDoIndex, name, date, time, notes){
        var size = _this.data.length-1; 
        var category = _this.data[size-Categoryindex];
        var size2 = category.subToDo.length-1;

        var newData = {
            name: name,
            date: date,
            time: time,
            notes: notes,
        }  
        console.log(newData.time);   
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