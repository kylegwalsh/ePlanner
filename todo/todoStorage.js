angular.module('app').service('todoStorage', function ($q) {

    var _this = this;
    this.data = [];

    this.findAll = function(callback) {
        console.log("this is running at the beggining");
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

    this.updateIndexes = function(){
        for (var i=0; i<_this.data.length; i++) {
            _this.data[i]['id'] = i + 1;
        }
        this.sync();
    }

    this.sync = function() {
        chrome.storage.sync.set({todo: this.data}, function() {});
    }

    this.add = function (newContent) {
        var id = this.data.length + 1;
        var todo = {
            id: id,
            content: id,
            completed: false,
            color: "FFF2A20", // default color
            createdAt: new Date(),
            subToDo: new Array(0), // array to keep track of the subToDoS
        };
        console.log("new data");
        console.log(_this);
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

    this.removeSubToDo = function(Categoryindex, subToDoIndex){
        var size = _this.data.length-1; 
        var category = _this.data[size-Categoryindex]; // we have to go backwards essentially since on the DOM they are displayed backwards (newest first)
        category.subToDo.splice(category.subToDo.length-1-subToDoIndex, 1);
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