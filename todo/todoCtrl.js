'use strict';
var app = angular.module('app', []);

app.controller('todoCtrl', function ($scope, todoStorage) {

    $scope.todoStorage = todoStorage;

    $scope.$watch('todoStorage.data', function() {
        $scope.todoList = $scope.todoStorage.data;
    });

    $scope.todoStorage.findAll(function(data){
        $scope.todoList = data;
        $scope.$apply();

        angular.forEach($scope.todoList, function(item){ // at the start of loading a page, we itterate over the existing data and create HTML elements for each and add to the DOM
            $scope.addToDo(item.content)
        })
    });

    $scope.add = function() {
        todoStorage.add($scope.newContent);
        $scope.addToDo($scope.newContent); // when a new item is added, we add a corresponding HTML for it
        $scope.newContent = '';
    }

    $scope.remove = function(todo) {
        todoStorage.remove(todo);
    }

    $scope.removeAll = function() {
        todoStorage.removeAll(); // Clear in storage 
        $( "#ITEMS" ).empty(); // CLEAR DOM 
    }

    $scope.toggleCompleted = function() {
        todoStorage.sync();
    }

    $scope.addToDo = function(data){ // data is the category that gets set          
        /*  Heirarchy for TO-DO Item
                <TO-DO-ITEM>
                    <TO-DO-TITLE>
                        <TITLE-TEXT></>
                        <TITLE-BUTTON></>
                    </>
                    <SUB-TO-DO>
                        <SUB-SELECT></>
                        <SUB-NAME></>
                        <SUB-DATE></>
                        <SUB-OPTION></>
                    </>
                    <OPTIONSPAGE>
                    </>
                </>
            */
        var addMe = document.createElement('div'); // Create Div that will encapuslate the entire new HTML section, the parent 
        addMe.className = "TO-DO-ITEM";
                var top = document.createElement('div'); // Create Title div that houses To-Do category and button for in/out sliding
                top.className = "TO-DO-TITLE";
                var title  = document.createElement('div'); // title 
                title.className = "TITLE-TEXT";
                title.innerHTML = data;
                var button  = document.createElement('div'); // button
                button.className = "TITLE-BUTTON";
                button.innerHTML = "Click";

                // function to slide in/out the toDos for a category
                $(button).bind( "click", function() { 
                    $(this).parent().parent().children(".SUB-TO_DO").toggle("slow");
                    $(this).parent().parent().children(".OPTIONS").slideUp("slow"); // toggle away options in case they are open 
                });

        top.appendChild(title);  // append title and button the TOP div element
        top.appendChild(button);
        addMe.appendChild(top);

        var sub  = document.createElement('div'); // Create Div that houses the information for a single row To-DO
        sub.className = "SUB-TO_DO";
                var select  = document.createElement('div'); // This is where the draggable thing will be
                select.className = "SUB-SELECT";
                select.innerHTML = "#";
                var name  = document.createElement('div'); // The name will go here
                name.className = "SUB-NAME";
                name.innerHTML = "Finish work on the extension"; 
                var date = document.createElement('div');  // The date goes here
                date.className = "SUB-DATE";
                date.innerHTML = "3/15";
                var options  = document.createElement('div'); // The options will go here
                options.className = "SUB-OPTIONS";
                options.innerHTML = " ... ";
                $(options).bind( "click", function() {   
                    console.log("CLICKED");
                    $(this).parent().parent().children(".OPTIONS").slideToggle("slow"); // TODO toggle some options window
                });

                var optionsPage  = document.createElement('div'); // The options will go here
                optionsPage.className = "OPTIONS";
                optionsPage.innerHTML = " Settings and buttons should go here";

        sub.appendChild(select);
        sub.appendChild(name);
        sub.appendChild(date);
        sub.appendChild(options); // append select, name, date, options to TO-DO item, 
        addMe.appendChild(sub);  // append the whole thing to join up wit the title that was preivously added
        addMe.appendChild(optionsPage);

        $("#ITEMS").prepend(addMe); // here we actually append the newly created HTML section to the existing DOM
    }

});


// Temporary these are here, was running into errors putting these into separate files

// controller for the completed section area
app.controller('completed', function($scope) {



});

// controller for the calendar section area
app.controller('calendar', function($scope) {



});

// controller for hte settings section area
app.controller('settings', function($scope) {
 


});
