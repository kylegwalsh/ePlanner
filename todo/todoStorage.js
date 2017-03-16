angular.module('app').service('todoStorage', function ($q) {

    var _this = this;
    this.data = [];

    this.findAll = function(callback) {
        chrome.storage.sync.get('todo', function(keys) {
            if (keys.todo != null) {
                _this.data = keys.todo;
                for (var i=0; i<_this.data.length; i++) {
                    _this.data[i]['id'] = i + 1;
                }
                console.log(_this.data);
                callback(_this.data);
            }
        });
    }

    this.sync = function() {
        chrome.storage.sync.set({todo: this.data}, function() {});
    }

    this.add = function (newContent) {
        var id = this.data.length + 1;
        var todo = {
            id: id,
            content: newContent,
            completed: false,
            createdAt: new Date(),
            subToDo: new Array(1), // array to keep track of the subToDoS
        };

        this.data.push(todo);
        this.sync();
    }

    this.remove = function(todo) {
        this.data.splice(this.data.indexOf(todo), 1);
        this.sync();
    }

    this.addSubToDo = function(index, name, date, time){
        console.log("save is being added here");

        var category =  _this.data[index];
        var newData = {
            name: "newly added",
            date: new Date(),
            time: 0,
        }  
        category.subToDo.push(newData);         
        this.sync();

        console.log(category);
    }

    this.removeAll = function() {
        this.data = [];
        this.sync();
    }

});