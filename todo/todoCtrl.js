'use strict';
var app = angular.module('app', ['ui.calendar']);

app.controller('todoCtrl', function ($scope, $compile, todoStorage) {

    $scope.todoStorage = todoStorage;
    $scope.testing = "test";

    $scope.$watch('todoStorage.data', function() {
        $scope.todoList = $scope.todoStorage.data;
    });

    $scope.todoStorage.findAll(function(data){
        $scope.todoList = data;
        $scope.$apply();

        angular.forEach($scope.todoList, function(item){ // at the start of loading a page, we itterate over the existing data and create HTML elements for each and add to the DOM
            $scope.addCategory(item.content)
        })
    });

    $scope.add = function() {
        todoStorage.add($scope.newContent);
        $scope.addCategory($scope.newContent); // when a new item is added, we add a corresponding HTML for it
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

    $scope.addCategory = function(data){ // data is the category that gets set          
        /*  Heirarchy for TO-DO Item


                <Category>                      This is what gets created in this function, addCategory()
                    <CategoryBar>
                        <CategoryName></>
                        <CategoryToggle></>
                    </>
                    <div>
                        <SubToDo>               This and below gets added with with the addSubSection() function
                            <Checkbox></>
                            <SubName></>
                            <SubDateTime></>
                            <SubOptions></>
                        </>
                        <OptionsPAGE>
                        </>
                    </>

                    <div>                          Possible to have lots of SubToDos per category, just keep appending
                        <SubToDo>  
                            <Checkbox></>
                            <SubName></>
                            <SubDateTime></>
                            <SubOptions></>
                        </>
                        <OptionsPAGE>
                        </>
                    </>
                    <div END>                           This gets created in the addSubSectionTemplate() Function
                        <SubToDo>
                            <ADD-BUTTON>
                            </>
                        </>
                    </div>
                </>
            */
        var addMe = document.createElement('div'); // Create Div that will encapuslate the entire new HTML section, the parent 
        addMe.className = "Category";
            var top = document.createElement('div'); // Create Title div that houses To-Do category and button for in/out sliding
            top.className = "CategoryBar row";
            var title  = document.createElement('div'); // title 
            title.className = "CategoryName col-xs-10";
            title.innerHTML = data;
            var button  = document.createElement('div'); // toggle
            button.className = "CategoryToggle col-xs-1 col-xs-offset-1";
            button.innerHTML = "<i class='fa fa-lg fa-angle-down'></i>";

            // function to slide in/out the toDos for a category
            $(button).bind( "click", function() { 

               $(this).css('-webkit-transform', 'rotate(' + 180 + 'deg)');  // rotate image TODO don't know how to get current angle
               $(this).css('-moz-transform', 'rotate(' + 180 + 'deg)'); 
               $(this).css('-ms-transform', 'rotate(' + 180 + 'deg)'); 
               $(this).css('-o-transform', 'rotate(' + 180 + 'deg)');
               $(this).css('transform', 'rotate(' + 180 + 'deg)');


               $(this).parent().parent().children(".EndCategory").toggle("slow");
               $(this).parent().parent().children().children().children(".Options").slideUp("slow"); // toggle away options in case they are open     
            });               

        top.appendChild(title);  // append title and button the TOP div element
        top.appendChild(button);
        addMe.appendChild(top);

        /*
        var name = 'this is a test';
        var date = '4/20';

        $scope.addSubSectionForTodo(addMe, name, date)
        $scope.addSubSectionForTodo(addMe, name, date)
        $scope.addSubSectionForTodo(addMe, name, date)
        */
        $scope.addSubSectionTemplate(addMe); // append the "add" portion at the bottom
        $("#ITEMS").prepend(addMe); // here we actually append the newly created HTML section to the existing DOM
    }

    // This function adds the blank template that is at the bottom of every 
    $scope.addSubSectionTemplate = function(Category){
        var divider = document.createElement('div');
        divider.className ="EndCategory";
        var addnewbar  = document.createElement('div'); // Create Div that houses the information for a single row To-DO
        addnewbar.className = "AddNewTaskBar container";
        var addnew = document.createElement('div');
        addnew.className = "AddNewTask";
        addnew.innerHTML = "<i class='fa fa-plus'></i> &nbsp; &nbsp; Add New";

        $(addnew).bind( "click", function() {
            $scope.addSubSectionForTodo($(this), "testing", "4/20/2017", "4:20pm");
        });

        divider.appendChild(addnewbar);
        addnewbar.appendChild(addnew);
        Category.appendChild(divider);
    }

    $scope.addSubSectionForTodo = function(addSection, nameData, dateData, timeData){
        var divider = document.createElement('div');
        var sub  = document.createElement('div'); // Create Div that houses the information for a single row To-DO
        sub.className = "SubToDo row";
            var select  = document.createElement('div'); // This is where the draggable thing will be
            select.className = "Checkbox col-xs-offset-1 col-xs-1 vcenter";
            select.innerHTML = "<input type='checkbox'/>";
            var center = document.createElement('div');  // Top center row (for styling)
            center.className = "col-xs-9 vcenter";
            var name  = document.createElement('div'); // The name will go here
            name.className = "SubName row";
            name.innerHTML = nameData;
            var dateandtime = document.createElement('div');  // The date and time go here
            dateandtime.className = "SubDateTime row";
            dateandtime.innerHTML = dateData + "&nbsp; &nbsp;" + timeData;
            var Options  = document.createElement('div'); // The Options will go here
            Options.className = "SubOptions col-xs-1 vcenter";
            Options.innerHTML = "<i class='fa fa-ellipsis-h'></i>";
            $(Options).bind( "click", function() {   

                        if ($(this).parent().parent().children(".Options").css("display")=="none") {
                            // what we currently clicked on needs to be displayed
                            $(this).parent().parent().parent().children().children(".Options").slideUp("slow"); // close any other ones that my by open
                            $(this).parent().parent().children(".Options").slideDown("slow"); // Display options
                        }
                        else{
                            // what we currently clicked on needs to be closed
                            $(this).parent().parent().children(".Options").slideUp("slow"); // Close options
                        }        
            });


            var OptionsPage  = document.createElement('div'); // The Options will go here
            OptionsPage.className = "Options";

            var textInput = '<input type="text" ng-model="testing">Click Me</button>';
            var button = '<button type="button" ng-click="myFunc()">Click Me</button>';
            var temp = $compile(button)($scope);
            var temp2 = $compile(textInput)($scope);

            $(OptionsPage).append(temp2);
            $(OptionsPage).append(temp);
            $(OptionsPage).append('<div><input type="date"  name="date"></div>');
            $(OptionsPage).append('<div><input type="time" name="time"></div>');      
            $(OptionsPage).bind( "click", function() {   
                $(this).parent("SubName row").slideToggle("slow"); // TODO toggle some Options window
            });

        sub.appendChild(select);
        sub.appendChild(center);
        center.appendChild(name);
        center.appendChild(dateandtime);
        sub.appendChild(Options); // append select, name, date, Options to TO-DO item, 
        divider.appendChild(sub);
        divider.appendChild(OptionsPage);
        addSection.parent().prepend(divider);// append the whole thing to join up wit the title that was preivously added
        addSection.parent().children().children(".Options").slideUp("slow"); // close any existing options
        $(Options).parent().parent().children(".Options").slideDown("slow"); // make options for newly created ToDo visible


    }

    $scope.myFunc = function(){
        console.log("working");
        console.log($scope.testing + " is the current input");
    }


});






// Temporary these are here, was running into errors putting these into separate files

// controller for the completed section area
app.controller('completed', function($scope) {



});

// controller for the calendar section area
app.controller('calendar', function($scope,$compile,uiCalendarConfig) {
var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    
    $scope.changeTo = 'Hungarian';
    /* event source that pulls from google.com */
    $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Chicago' // an option!
    };
    /* event source that contains custom events on the scope */
    $scope.events = [
      {title: 'All Day Event',start: new Date(y, m, 1)},
      {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
      {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
      {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];

    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
    };
    /* alert on Drop */
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
      var canAdd = 0;
      angular.forEach(sources,function(value, key){
        if(sources[key] === source){
          sources.splice(key,1);
          canAdd = 1;
        }
      });
      if(canAdd === 0){
        sources.push(source);
      }
    };
    /* add custom event*/
    $scope.addEvent = function() {
      $scope.events.push({
        title: 'Open Sesame',
        start: new Date(y, m, 28),
        end: new Date(y, m, 29),
        className: ['openSesame']
      });
    };
    /* remove event */
    $scope.remove = function(index) {
      $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
      if(uiCalendarConfig.calendars[calendar]){
        uiCalendarConfig.calendars[calendar].fullCalendar('render');
      }
    };
     /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) { 
        element.attr({'tooltip': event.title,
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
    };
    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'title',
          center: '',
          right: 'today,prev,next'
        },
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };
    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
});

// controller for hte settings section area
app.controller('settings', function($scope) {
 


});


