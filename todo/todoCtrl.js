'use strict';
var app = angular.module('app', ['ui.calendar']);

app.controller('todoCtrl', function ($scope, $compile, todoStorage) {

    $scope.todoStorage = todoStorage;

    $scope.$watch('todoStorage.data', function() {
        $scope.todoList = $scope.todoStorage.data;
    });

    $scope.todoStorage.findAll(function(data){
        $scope.todoList = data;
        $scope.$apply();

        angular.forEach($scope.todoList, function(item, value){ // at the start of loading a page, we itterate over the existing data and create HTML elements for each and add to the DOM
            var htmlCategory = $scope.addCategory(item.content, value, item.color) // Loop through each of the categories 
            var arrayLength = item.subToDo.length;
            for(var j=0; j < item.subToDo.length; j++){
                $scope.displaySubSectionForTodo( htmlCategory, item.subToDo[j].name,$scope.formatDate(new Date(item.subToDo[j].date)),item.subToDo[j].time, item.subToDo[j].notes, false);          
            }
        })


    });

    $scope.add = function() {
        var index = todoStorage.add();
        var categoryHTML = $scope.addCategory("",index, "F5B041"); // when a new item is added, we add a corresponding HTML for it
        $scope.newContent = '';
    }

    $scope.remove = function(index) {
        todoStorage.remove(index);
    }

    $scope.removeAll = function() {
        todoStorage.removeAll(); // Clear in storage 
        $( "#ITEMS" ).empty(); // CLEAR DOM 
    }

    $scope.toggleCompleted = function() {
        todoStorage.sync();
    }

    $scope.addCategory = function(data, index, color){ // data is the category that gets set          
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
                        <todoOverlay>
                        </>
                    </>

                    <div>                          Possible to have lots of SubToDos per category, just keep appending
                        <SubToDo>  
                            <Checkbox></>
                            <SubName></>
                            <SubDateTime></>
                            <SubOptions></>
                        </>
                        <todoOverlay>
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
            top.style.backgroundColor = "#" + color; // updates the color in the Category
            var title  = document.createElement('input'); // title
            title.type = "text"; 
            title.className = "CategoryName col-xs-9 col-xs-offset-1";
            title.value = data;
            title.style.backgroundColor = "#" + color;
            var buttonB4  = document.createElement('div'); // settings for the category
            buttonB4.innerHTML = "<i class='fa fa-lg fa-ellipsis-h'></i>";
            buttonB4.className = "CategoryOptions col-xs-1";

            $(title).blur(function() {
                title.style.backgroundColor = "#" + color;
                todoStorage.changeCategoryName(index, title.value);
            });

            // If user presses enter, remove focus
            $(title).bind('keydown', function(event) {
                if(event.keyCode == 13){
                   title.blur();
                }
            });

            // CATEGORY OVERLAY
            $(buttonB4).bind( "click",{ category: addMe},  function(event) {
                var categoryOverlay = document.getElementById("CategoryOptionsOverlay");
                var todoOverlay = document.getElementById("TodoOptionsOverlay");

                // Close todo overlay incase it's open
                todoOverlay.innerHTML = ""; // clear contents of overlay
                todoOverlay.style.display = "none";  // close overlay

                // Closes options if they're open
                if(categoryOverlay.style.display == "inline-block"){
                    categoryOverlay.innerHTML = ""; // clear contents of overlay
                    categoryOverlay.style.display = "none";  // close overlay
                }
                // Otherwise, sets up menu
                else{
                    var element = top;
                    var offTop = 0;
                    do {
                        offTop += element.offsetTop  || 0;
                        element = element.offsetParent;
                    } while(element);

                    categoryOverlay.style.top = offTop - 90 + 'px';
                    categoryOverlay.style.display = "inline-block";
                    
                    var editButton = document.createElement('div');
                    editButton.innerHTML = "Edit Course";
                    editButton.className = "menu-item top-item";

                    $(editButton).bind('click', function(){
                        categoryOverlay.innerHTML = ""; // clear contents of overlay
                        categoryOverlay.style.display = "none";  // close overlay         
                        title.focus();
                        title.select();
                    });

                    var colorOption = document.createElement('div');
                    colorOption.className = "row menu-item";
       
                    var colorPicker  = document.createElement('input'); // colorPicker
                    colorPicker.className= "noselect jscolor"; // DON'T change this
                    colorPicker.style.display = "inline-block";
                    colorPicker.style.float = "left";
                    colorPicker.style.marginLeft = "15px";
                    colorPicker.style.marginTop = "3px";
                    colorPicker.disabled = 'readonly';
                    colorPicker.value = color; // default color

                    $(colorPicker).ready(function() {
                      jscolor.installByClassName("jscolor"); // don't change this
                    });

                    var colorButton  = document.createElement('div'); // toggle on/off button
                    colorButton.innerHTML = "Change Color";

                    $(colorOption).bind('click', function(){
                         top.style.backgroundColor = "#" + colorPicker.value; // updates the color in the Category
                         title.style.backgroundColor = "#" + colorPicker.value;
                         color = colorPicker.value;
                         todoStorage.changeCategoryColor(index,colorPicker.value);
                         console.log("(ColorPicker) Category Index " + index + " color changed to: " + colorPicker.value);
                    });

                    var deleteCategory = document.createElement('div');
                    deleteCategory.className = "menu-item";
                    deleteCategory.innerHTML = "Delete Course";

                    $(deleteCategory).bind('click', {category: event.data.category }, function(event){
                        var data = event.data.category;
                        $(data).empty(); // deletes the entire Category in the HTML
                        todoStorage.remove(index); // remove Category from memory
                        categoryOverlay.innerHTML = ""; // clear contents of overlay
                        categoryOverlay.style.display = "none";  // close overlay
                    });

                    $(categoryOverlay).blur(function() {
                        categoryOverlay.innerHTML = ""; // clear contents of overlay
                        categoryOverlay.style.display = "none";  // close overlay
                    });

                     categoryOverlay.appendChild(editButton);
                     categoryOverlay.appendChild(colorOption);
                     categoryOverlay.appendChild(deleteCategory);
                     colorOption.appendChild(colorPicker);
                     colorOption.appendChild(colorButton);
                }
            });

            var button  = document.createElement('div'); // toggle
            button.className = "CategoryToggle col-xs-1 rotate";
            button.innerHTML = "<i class='fa fa-lg fa-angle-down'></i>";

            // function to slide in/out the toDos for a category
            $(button).bind( "click", function() { 
               $(this).toggleClass("up");
               $(this).parent().parent().children(".EndCategory").toggle("slow");
               $(this).parent().parent().children().children().children(".Options").slideUp("slow"); // toggle away options in case they are open     
            });               

        top.appendChild(title);  // append title and button the TOP div element
        top.appendChild(buttonB4);
        top.appendChild(button);
        addMe.appendChild(top);

        var templateToAdd = $scope.addSubSectionTemplate(addMe, index); // append the "add" portion at the bottom
        $("#ITEMS").prepend(addMe); // here we actually append the newly created HTML section to the existing DOM

        // Focus on title of it doesn't have one
        if(data == ""){
            title.focus();
            title.select();
        }

        return templateToAdd;
    }


    // This function adds the blank template that is at the bottom of every category
    $scope.addSubSectionTemplate = function(Category, index){
        var divider = document.createElement('div');
        divider.className ="EndCategory";
        var addnewbar  = document.createElement('div'); // Create Div that houses the information for a single row To-DO
        addnewbar.className = "AddNewTaskBar container";
        var addnew = document.createElement('div');
        addnew.className = "AddNewTask";
        addnew.innerHTML = "<i class='fa fa-plus'></i> &nbsp; &nbsp; Add New Assignment";

        $(addnew).bind( "click", function() {
            // call funciton to save the new information
            $scope.saveSubSectionForTodo(index, $(this), "", "", "", "");

            // call function to display the information
            $scope.displaySubSectionForTodo( $(this), "", "", "", "", false);
        });

        divider.appendChild(addnewbar);
        addnewbar.appendChild(addnew);
        Category.appendChild(divider);
        return $(addnew);
    }

    $scope.saveSubSectionForTodo = function(index, addSection, nameData, dateData, timeData, notesData){
           todoStorage.addSubToDo(index,nameData,dateData,timeData, notesData)
    }

    $scope.displaySubSectionForTodo = function(addSection, nameData, dateData, timeData, notesData, boolean){

        var divider = document.createElement('div');
        divider.className = "Divider";
        var sub  = document.createElement('div'); // Create Div that houses the information for a single row To-DO
        sub.className = "SubToDo row";


            // TODO CSS stuff here, TODO gets structured here
            var select  = document.createElement('div'); // This is where the draggable thing will be
            select.className = "Checkbox col-xs-offset-1 col-xs-1 vcenter";
            select.innerHTML = "<input type='checkbox'/>";
            var center = document.createElement('div');  // Top center row (for styling)
            center.className = "col-xs-9 vcenter";
            var name  = document.createElement('input'); // The name will go here
            name.type = "text";
            name.className = "SubName row";
            name.value = nameData;
            var notes  = document.createElement('div'); // The notes will go here
            notes.className = "Notes";
            notes.innerHTML = notesData;
            var dateandtime = document.createElement('div');  // The date and time go here
            dateandtime.className = "SubDateTime row";
            dateandtime.innerHTML = dateData + "&nbsp; &nbsp;" + timeData;
            var Options  = document.createElement('div'); // The Options will go here
            Options.className = "todoOptionsButton col-xs-1 vcenter";
            Options.innerHTML = "<i class='fa fa-ellipsis-h'></i>";

            // Save changes to todo name
            $(name).blur(function() {
                // TODO ADD FUNCTION TO SAVE INDIVIDUAL FIELDS
                var child = divider;
                var parent = $(divider).parent();
                var subToDoindex = $(parent).children(".Divider").index(child);
                // subToDoindex contains the value of what we currently want to delete
                console.log("SubToDoIndex: " + subToDoindex);

                var categoryChild = $(divider).parent().parent().parent();
                var categoryParent = $(divider).parent().parent().parent().parent();
                var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                // categoryIndex contains the value of the entire Category that the subToDo is being deleted in
                console.log("categoryIndex: " + categoryIndex);

                // categoryIndex contains the value of the entire Category that the subToDo is being updated in
                todoStorage.changeSubToDoName(categoryIndex, subToDoindex, name.value);
            });

            // If user presses enter, remove focus
            $(name).bind('keydown', function(event) {
                if(event.keyCode == 13){
                   name.blur();
                }
            });

            // Bring up options menu when option button clicked
            $(Options).bind( "click",  function(event) {
                var todoOverlay = document.getElementById("TodoOptionsOverlay");
                var categoryOverlay = document.getElementById("CategoryOptionsOverlay");

                // Close category overlay incase it's open
                categoryOverlay.innerHTML = ""; // clear contents of overlay
                categoryOverlay.style.display = "none";  // close overlay

                // Closes options if they're open
                if(todoOverlay.style.display == "inline-block"){
                    todoOverlay.innerHTML = ""; // clear contents of overlay
                    todoOverlay.style.display = "none";  // close overlay
                }
                // Otherwise, sets up menu
                else{
                    var element = Options;
                    var offTop = 0;
                    do {
                        offTop += element.offsetTop  || 0;
                        element = element.offsetParent;
                    } while(element);

                    todoOverlay.style.top = offTop - 100 + 'px';
                    todoOverlay.style.display = "inline-block";

                    var editButton = document.createElement("div"); // The button to confirm the user click to update everything 
                    editButton.className = "menu-item top-item";
                    editButton.innerHTML = "Edit";
                    // TODO modify CSS and class stuff here 

                    var addNote = document.createElement("textarea"); // button that brings up notes text field
                    addNote.className = "menu-item";
                    addNote.innerHTML = "Add Notes";
                    // TODO modify CSS and class stuff here

                    var datePicker = document.createElement("input"); // date picker
                    datePicker.type = "date";
                    datePicker.className = "DatePicker"; 
                    // TODO modify CSS and class stuff here

                    var timePicker = document.createElement("input"); // Time picker
                    timePicker.type = "time";
                    timePicker.className = "TimePicker";

                    var oldButton = document.createElement("button");
                    oldButton.innerHTML = "Old Update Button";

                    // Edit todo name
                    $(editButton).bind("click", function(){
                        todoOverlay.innerHTML = ""; // clear contents of overlay
                        todoOverlay.style.display = "none";  // close overlay         
                        name.focus();
                        name.select();
                    });

                    // $(oldButton).bind("click", function(){   // Button that handles updating the TODO
                    //     var userInput = $(this).parent().children(".OptionsText").val(); // get the input that is in the textBox
                    //     $(this).parent().parent().children().children().children(".SubName").html(userInput); // update the data

                    //     var userInputNotes = $(this).parent().children(".NoteInput").val(); // get the input that is in the textBox
                    //     $(this).parent().parent().children().children().children(".Notes").html(userInputNotes); // update the data
                    //     var datePickerValue = $(this).parent().children(".DatePicker").val();
                    //     var addNote = $(this).parent().children(".Text").val();
                    //     var date  = new Date(datePickerValue);
     

                    //     var timeInput = $(this).parent().children(".TimePicker").val(); // get the time input value
                    //     var test = $scope.formatTime(timeInput);      
                       
                    //     var child = $(this).parent().parent();
                    //     var parent = $(this).parent().parent().parent();
                    //     var subToDoindex = $(parent).children(".Divider").index(child);
                    //     // subToDoindex contains the value of what we currently want to edit

                    //     var categoryChild = $(this).parent().parent().parent().parent().parent();
                    //     var categoryParent = $(this).parent().parent().parent().parent().parent().parent();
                    //     var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                    //     // Category of the subToDo that we want to edit

                    //     todoStorage.modifySubToDo(categoryIndex, subToDoindex, userInput, datePickerValue, timeInput, userInputNotes); // Update in memory
                    //     $(this).parent().parent().children().children().children(".SubDateTime").html($scope.formatDate(date)    + " " + timeInput); // Update in HTML                  
                    // });


                    var deleteTodo = document.createElement('div');  // Delete button for the Todo that is at the bottom
                    deleteTodo.className = "menu-item";
                    deleteTodo.innerHTML = "Delete Assignment";
                    
                    $(deleteTodo).bind( "click", function() {    // button that handles deleting a TODO
                        var child = divider;
                        var parent = $(divider).parent();
                        var subToDoindex = $(parent).children(".Divider").index(child);
                        // subToDoindex contains the value of what we currently want to delete

                        var categoryChild = $(divider).parent().parent().parent();
                        var categoryParent = $(divider).parent().parent().parent().parent();
                        var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                        // categoryIndex contains the value of the entire Category that the subToDo is being deleted in

                        todoStorage.removeSubToDo(categoryIndex, subToDoindex); // Clear from memory
                        divider.remove(); // Clear from HTML
                        todoOverlay.innerHTML = ""; // clear contents of overlay
                        todoOverlay.style.display = "none";  // close overlay
                    });
                    
                    todoOverlay.appendChild(editButton);
                    todoOverlay.appendChild(addNote);
                    todoOverlay.appendChild(datePicker);
                    todoOverlay.appendChild(timePicker);
                    todoOverlay.appendChild(deleteTodo);    
                }
            });        

        sub.appendChild(select);
        sub.appendChild(center);
        center.appendChild(name);
        center.appendChild(notes);
        center.appendChild(dateandtime);
        sub.appendChild(Options); // append select, name, date, Options to TO-DO item, 
        divider.appendChild(sub);
        addSection.parent().prepend(divider);// append the whole thing to join up wit the title that was preivously added
    }

    $scope.formatTime = function(date){
        // Time isn't working for some reason, idk 

    }

    // function used to format date month/day/year
    $scope.formatDate = function(date){
        var day = date.getDate() +1; // ?!?!? i have no idea why but I have to add 1 for some reason 
        var month = date.getMonth() +1;  // ?!?!? i have no idea why but I have to add 1 for some reason 
        var year =  date.getFullYear();  // ?!?!? year is fine for some reason 
        return month + "/" + day + "/" + year;
    }

});






// Temporary these are here, was running into errors putting these into separate files

// controller for the completed section area
app.controller('completed', function($scope) {



});

// controller for the calendar section area
app.controller('calendar', function($scope,$compile,uiCalendarConfig, todoStorage) {
    $scope.todoStorage = todoStorage;

    $scope.$watch('todoStorage.data', function() {
        $scope.todoList = $scope.todoStorage.data;
    });

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.events = [];
    $scope.events.push({title: 'instantiate',start: new Date(y, m, 1)});

    $scope.todoStorage.findAll(function(data){
        $scope.todoList = data;
        $scope.$apply();
        var count = 0;
        angular.forEach($scope.todoList, function(item){ // at the start of loading a page, we itterate over the existing data and create HTML elements for each and add to the DOM
            
            for(var j=0; j < item.subToDo.length; j++){
                $scope.addEvent(item.subToDo[j], item.color);
                if(count == 0){
                    $scope.remove(0)
                }
                count = count + 1;         
            } 
        })

    });
    // $scope.events = [
    //   {title: 'All Day Event',start: new Date(y, m, 1)},
    //   {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
    //   {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
    //   {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
    //   {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
    //   {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    // ];

    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title);
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
    $scope.addEvent = function(subToDo, color) {
      var eventDate = new Date(subToDo.date);
      eventDate.setDate(eventDate.getDate() + 1);
      $scope.events.push({
        title: subToDo.name,
        start: eventDate,
        backgroundColor: "#" + color,
        //start: $scope.setTime(eventDate, subToDo.time)
        stick: true
      });
    };
    /* remove event */
    $scope.remove = function(index) {
      $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
      if(uiCalendarConfig.calendars[calendar]){
        uiCalendarConfig.calendars[calendar].fullCalendar('render');
      }
    };
     /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) { 
        element.attr({'uib-tooltip-html': "\'<p>" + event.title + "</p>\'",
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
    };

    $scope.setTime = function setDateTime(date, time) {
        var index = time.indexOf(":"); 
        var index2 = time.indexOf(" ");

        var hours = time.substring(0, index);
        var minutes = time.substring(index + 1, index2);

        var mer = time.substring(index2 + 1, time.length);


        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds("00");

        return date;
    }
    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        eventTextColor: "black",
        eventBoarderColor: "black",
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
    $scope.eventSources = [$scope.events];
});

// controller for hte settings section area
app.controller('settings', function($scope) {
 


});


