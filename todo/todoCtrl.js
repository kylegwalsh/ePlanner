'use strict';
var app = angular.module('app', ['ui.calendar']);

app.controller('todoCtrl', function ($scope, $compile, todoStorage, NotifyingColorService2, NotifyingColorService, NotifyUndo ) {

    $scope.todoStorage = todoStorage;
    $scope.checkBoxCount = 0;
    $scope.backUp;

    $scope.$watch('todoStorage.data', function() {
        $scope.todoList = $scope.todoStorage.data;
    });

    $scope.$watch('todoStorage.persistentInformation', function(){
        $scope.extraInformation = $scope.todoStorage.persistentInformation;
    });

    $scope.todoStorage.findAll2(function(data){

    });


    $scope.todoStorage.findAll(function(data){
        $("#ITEMS").innerHTML = "";
        $scope.todoList = data;
        $scope.$apply();
        NotifyingColorService2.notify($scope.extraInformation.topColor,$scope.extraInformation.reminders, $scope.extraInformation.notificationSound);
        $scope.updateEverything();
    });

    $scope.updateEverything= function(){
        $scope.todoList = $scope.todoStorage.data;
        angular.forEach($scope.todoList, function(item, value){ // at the start of loading a page, we itterate over the existing data and create HTML elements for each and add to the DOM
            var htmlCategory = $scope.addCategory(item.content, value, item.color) // Loop through each of the categories 
            var arrayLength = item.subToDo.length;
            for(var j=0; j < item.subToDo.length; j++){
                $scope.displaySubSectionForTodo( htmlCategory, item.subToDo[j].name,item.subToDo[j].date,item.subToDo[j].time, item.subToDo[j].notes, false);
            }
        })
    }

    $scope.add = function() {
        var index = todoStorage.add($scope.colorInfo);
        var categoryHTML = $scope.addCategory("",index, $scope.colorInfo); // when a new item is added, we add a corresponding HTML for it
        $scope.newContent = '';
    }

    $scope.remove = function(index) {
        todoStorage.remove(index);
        $("#ITEMS").innerHTML = "";
        $scope.updateEverything();
    }

    $scope.toggleCompleted = function() {
        todoStorage.sync();
    }

    NotifyingColorService.subscribe($scope, function somethingChanged(event, info) {
        $scope.colorInfo = info;
    }); 

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
                var categoryChild = $(addMe);
                var categoryParent = $(addMe).parent();
                var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                todoStorage.changeCategoryName(categoryIndex, title.value);
            });

            // If user presses enter, remove focus
            $(title).bind('keydown', function(event) {
                if(event.keyCode == 13){
                   title.blur();
                }
            });

            // CATEGORY OVERLAY
            $(buttonB4).bind( "click",{ category: addMe},  function(event) {
                event.stopPropagation();
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

                    $(colorPicker).bind('click', function(){
                        event.stopPropagation();
                    });

                    $(colorPicker).ready(function() {
                      jscolor.installByClassName("jscolor"); // don't change this
                    });

                    var colorButton  = document.createElement('div'); // toggle on/off button
                    colorButton.innerHTML = "Change Color";

                    $(colorButton).bind('click', function(){
                        event.stopPropagation();
                    });

                    $(colorOption).bind('click', function(){
                         event.stopPropagation();
                         top.style.backgroundColor = "#" + colorPicker.value; // updates the color in the Category
                         title.style.backgroundColor = "#" + colorPicker.value;
                         color = colorPicker.value;
                         var categoryChild = $(addMe);
                         var categoryParent = $(addMe).parent();
                         var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                         todoStorage.changeCategoryColor(categoryIndex,colorPicker.value);
                    });

                    var deleteCategory = document.createElement('div');
                    deleteCategory.className = "menu-item";
                    deleteCategory.innerHTML = "Delete Course";

                    $(deleteCategory).bind('click', {category: event.data.category }, function(event){
                        var data = event.data.category;   
                        var categoryChild = $(addMe);
                        var categoryParent = $(addMe).parent();
                        var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                        todoStorage.remove(categoryIndex); // remove Category from memory
                        addMe.remove(); 
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

        var templateToAdd = $scope.addSubSectionTemplate(addMe, addMe); // append the "add" portion at the bottom
        $("#ITEMS").prepend(addMe); // here we actually append the newly created HTML section to the existing DOM

        // Focus on title of it doesn't have one
        if(data == ""){
            title.focus();
            title.select();
        }

        return templateToAdd;
    }


    // This function adds the blank template that is at the bottom of every category
    $scope.addSubSectionTemplate = function(Category, addMe){
        var divider = document.createElement('div');
        divider.className ="EndCategory";
        var addnewbar  = document.createElement('div'); // Create Div that houses the information for a single row To-DO
        addnewbar.className = "AddNewTaskBar container";
        var addnew = document.createElement('div');
        addnew.className = "AddNewTask";
        addnew.innerHTML = "<i class='fa fa-plus'></i> &nbsp; &nbsp; Add New Assignment";

        $(addnew).bind( "click", function() {
            // call function to save the new information
            var categoryChild = $(addMe);
            var categoryParent = $(addMe).parent();
            var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);

            $scope.saveSubSectionForTodo(categoryIndex, $(this), "", "", "", "");
            // call function to display the information
            $scope.displaySubSectionForTodo( $(this), "", "", "", "", true);    
        });

        divider.appendChild(addnewbar);
        addnewbar.appendChild(addnew);
        Category.appendChild(divider);
        return $(addnew);
    }

    $scope.saveSubSectionForTodo = function(index, addSection, nameData, dateData, timeData, notesData){
           todoStorage.addSubToDo(index,nameData,dateData,timeData, notesData)
    }

    $scope.$watch(

        function( scope ) {
            // Return the "result" of the watch expression.
            return( scope.checkBoxCount);
        },
        function( newValue, oldValue ) {
                 if(newValue == 0){
                    setTimeout(function(){  
                        $("#UndoCompleteOverlay").css("display", "none");
                    }, 10000);
            }
        }
    );

    $scope.undo = function(){
        $("#ITEMS").empty(); // clear HTML
        todoStorage.restoreData(); // Load backup data that was saved 
        $scope.updateEverything(); // update entire HTML
        todoStorage.clearSavedInfo();
         $("#UndoCompleteOverlay").css("display", "none"); // make undo button not visible 
         for(var i =0; i<$scope.timeouts.length; i++){
            var temp = $scope.timeouts[i];
            clearTimeout(temp);
         }
         $scope.checkBoxCount = 0;
         $scope.timeouts = new Array();

    }
    $scope.ignore = function(){
        $("#UndoCompleteOverlay").css("display", "none"); // make undo button not visible
         todoStorage.clearSavedInfo(); // clear saved stuff so can't be restored 
        for(var i =0; i<$scope.timeouts.length; i++){
            var temp = $scope.timeouts[i];
            clearTimeout(temp);
         }
         $scope.checkBoxCount = 0;
         $scope.timeouts = new Array();
    }

    $scope.timeouts;

    $scope.displaySubSectionForTodo = function(addSection, nameData, dateData, timeData, notesData, newToDoBool){

        var divider = document.createElement('div');
        divider.className = "Divider";
        var sub  = document.createElement('div'); // Create Div that houses the information for a single row To-DO
        sub.className = "SubToDo row";
            var select  = document.createElement('input'); // This is where the draggable thing will be
            select.className = "Checkbox col-xs-offset-1 col-xs-1 vcenter";
            select.style.width = "10px";
            select.style.marginLeft = "55px";
            select.type = 'checkbox';

            $(select).change(function(event) {   // event for when it is checked 
                if(select.checked){
                        $("#UndoCompleteOverlay").css("display", "inline-block"); // make undo button visible

                        if($scope.checkBoxCount == 0){
                            todoStorage.backupCompleteData(); // save all current completed stuff
                            todoStorage.backUp(categoryIndex, subToDoindex); // clone all current TODOs
                            $scope.timeouts = new Array();
                        }
                        $scope.checkBoxCount++;
                        $scope.$digest();
                        var child = divider;
                        var parent = $(divider).parent();
                        var subToDoindex = $(parent).children(".Divider").index(child);

                        var categoryChild = $(divider).parent().parent().parent();
                        var categoryParent = $(divider).parent().parent().parent().parent();
                        var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                        
                        todoStorage.markToDoAsComplete(categoryIndex, subToDoindex); // adds to persistentStorage 
                        todoStorage.removeSubToDo(categoryIndex, subToDoindex); // Clear from memory 
                          
                        var animation = setTimeout(function(){
                            divider.remove(); // Clear from html 
                        }, 300);

                        var timeoutFunction = setTimeout(function(){
                            $scope.checkBoxCount--;
                            if($scope.checkBoxCount == 0){
                                $("#UndoCompleteOverlay").css("display", "none"); // make undo button visible
                            }    
                        }, 6000);
                              $scope.timeouts.push(timeoutFunction);
                      
                } else {

                }

                
            })
            var center = document.createElement('div');  // Top center row (for styling)
            center.className = "col-xs-9 vcenter";
            var name  = document.createElement('input'); // The name will go here
            name.type = "text";
            name.className = "SubName row";
            name.value = nameData;
            var notes  = document.createElement('textarea'); // The notes will go here
            notes.className = "Notes row";
            notes.value = notesData;
            var dateandtime = document.createElement('div');  // The date and time go here
            dateandtime.className = "SubDateTime row";
            var date = document.createElement('input');
            date.type = 'date';
            date.value = dateData;
            date.className = "date";
            var time = document.createElement('input');
            time.type = 'time';
            time.value = timeData;
            time.className = "time";
            var Options  = document.createElement('div'); // The Options will go here
            Options.className = "todoOptionsButton col-xs-1 vcenter";
            Options.innerHTML = "<i class='fa fa-ellipsis-h'></i>";

            // Save changes to todo name
            $(name).blur(function() {
                var child = divider;
                var parent = $(divider).parent();
                var subToDoIndex = $(parent).children(".Divider").index(child);
                // subToDoindex contains the value of what we currently want to delete

                var categoryChild = $(divider).parent().parent().parent();
                var categoryParent = $(divider).parent().parent().parent().parent();
                var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                // categoryIndex contains the value of the entire Category that the subToDo is being deleted in

                // categoryIndex contains the value of the entire Category that the subToDo is being updated in
                todoStorage.changeSubToDoName(categoryIndex, subToDoIndex, name.value);

                if(date.value == "" && dateandtime.style.display == "inline-block"){
                    date.focus();
                    date.select();
                }
            });

            // Save changes to todo notes
            $(notes).blur(function() {
                var child = divider;
                var parent = $(divider).parent();
                var subToDoIndex = $(parent).children(".Divider").index(child);
                // subToDoindex contains the value of what we currently want to delete

                var categoryChild = $(divider).parent().parent().parent();
                var categoryParent = $(divider).parent().parent().parent().parent();
                var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                // categoryIndex contains the value of the entire Category that the subToDo is being deleted in

                // categoryIndex contains the value of the entire Category that the subToDo is being updated in
                todoStorage.changeSubToDoNotes(categoryIndex, subToDoIndex, notes.value);

                // don't show notes if we don't have one
                if(notes.value == ""){
                    notes.style.display = "none";
                }
            });

            // Save changes to todo date
            $(date).blur(function() {
                var child = divider;
                var parent = $(divider).parent();
                var subToDoIndex = $(parent).children(".Divider").index(child);
                // subToDoindex contains the value of what we currently want to delete

                var categoryChild = $(divider).parent().parent().parent();
                var categoryParent = $(divider).parent().parent().parent().parent();
                var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                // categoryIndex contains the value of the entire Category that the subToDo is being deleted in

                // categoryIndex contains the value of the entire Category that the subToDo is being updated in
                todoStorage.changeSubToDoDate(categoryIndex, subToDoIndex, date.value); 

                // don't allow time field without a date field
                if(date.value == ""){
                    todoStorage.changeSubToDoTime(categoryIndex, subToDoIndex, "");
                    time.value = "";
                    dateandtime.style.display = "none";
                }
                // Check if overdue
                if((time.value == "") && (time.style.display == "none")){
                    if(new Date(date.value + " 00:00") < Date.now()){
                        name.style.color = "red";
                    }
                    else{
                        name.style.color = "black";
                    }
                }
                else if(time.value != ""){
                    if(new Date(date.value + " " + time.value) < Date.now()){
                        name.style.color = "red";
                    }
                    else{
                        name.style.color = "black";
                    }
                }
            });

            // Save changes to todo date
            $(time).blur(function() {
                var child = divider;
                var parent = $(divider).parent();
                var subToDoIndex = $(parent).children(".Divider").index(child);
                // subToDoindex contains the value of what we currently want to delete

                var categoryChild = $(divider).parent().parent().parent();
                var categoryParent = $(divider).parent().parent().parent().parent();
                var categoryIndex = $(categoryParent).children(".Category").index(categoryChild);
                // categoryIndex contains the value of the entire Category that the subToDo is being deleted in

                // categoryIndex contains the value of the entire Category that the subToDo is being updated in
                todoStorage.changeSubToDoTime(categoryIndex, subToDoIndex, time.value);

                // don't show time field if we don't have one
                if(time.value == ""){
                    time.style.display = "none";
                }
                // Check if overdue
                if(time.value == ""){
                    if(new Date(date.value + " 00:00") < Date.now()){
                        name.style.color = "red";
                    }
                    else{
                        name.style.color = "black";
                    }
                }
                else{
                    if(new Date(date.value + " " + time.value) < Date.now()){
                        name.style.color = "red";
                    }
                    else{
                        name.style.color = "black";
                    }
                }
            });

            // If user presses enter, remove focus
            $(name).bind('keydown', function(event) {
                if(event.keyCode == 13){
                    if(date.value == "" && dateandtime.style.display == "inline-block"){
                        date.focus();
                        date.select();
                    }
                    else{
                        name.blur();
                    }
                }
            });

            // If user presses enter, remove focus
            $(notes).bind('keydown', function(event) {
                if(event.keyCode == 13){
                    notes.blur();
                }
            });

            // If user presses enter, remove focus
            $(date).bind('keydown', function(event) {
                if(event.keyCode == 13){
                    if((time.value == "") && (time.style.display != "none")){
                        time.focus();
                        time.select();
                    }
                    else{
                        date.blur();
                    }
                }
            });

            // If user presses enter, remove focus
            $(time).bind('keydown', function(event) {
                if(event.keyCode == 13){
                   time.blur();
                }
            });

            // Check if overdue
            if(time.value == ""){
                if(new Date(date.value + " 00:00") < Date.now()){
                    name.style.color = "red";
                }
                else{
                    name.style.color = "black";
                }
            }
            else{
                if(new Date(date.value + " " + time.value) < Date.now()){
                    name.style.color = "red";
                }
                else{
                    name.style.color = "black";
                }
            }

            // Bring up options menu when option button clicked
            $(Options).bind( "click",  function(event) {
                event.stopPropagation();
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
                    editButton.innerHTML = "Edit Name";

                    var addNote = document.createElement("div"); // button that brings up notes text field
                    addNote.className = "menu-item";
                    addNote.innerHTML = "Add Notes";

                    var dateButton = document.createElement("div"); // date picker
                    dateButton.className = "menu-item"; 
                    dateButton.innerHTML = "Change Date";

                    var timeButton = document.createElement("div"); // edit time
                    timeButton.className = "menu-item";
                    timeButton.innerHTML = "Change Time";

                    // Edit todo name
                    $(editButton).bind("click", function(){
                        todoOverlay.innerHTML = ""; // clear contents of overlay
                        todoOverlay.style.display = "none";  // close overlay         
                        name.focus();
                        name.select();
                    });

                    // Edit todo notes
                    $(addNote).bind("click", function(){
                        todoOverlay.innerHTML = ""; // clear contents of overlay
                        todoOverlay.style.display = "none";  // close overlay
                        // If there was no date, we need to show the date section
                        if(notes.value == ""){
                            notes.style.display = "inline-block";
                        }                               
                        notes.focus();
                        notes.select();
                    });


                    // Edit todo date
                    $(dateButton).bind("click", function(){
                        todoOverlay.innerHTML = ""; // clear contents of overlay
                        todoOverlay.style.display = "none";  // close overlay
                        // If there was no date, we need to show the date section
                        if(date.value == ""){
                            dateandtime.style.display = "inline-block";
                            time.style.display = "inline-block";
                        }       
                        date.focus();
                        date.select();
                    });

                    // Edit todo time
                    $(timeButton).bind("click", function(){
                        todoOverlay.innerHTML = ""; // clear contents of overlay
                        todoOverlay.style.display = "none";  // close overlay
                        if((date.value != "") && (time.value == "")){
                            time.style.display = "inline-block";
                        }         
                        time.focus();
                        time.select();
                    });

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
                    todoOverlay.appendChild(dateButton);

                    // if there's no date, don't display time option
                    if(date.value != ""){
                        todoOverlay.appendChild(timeButton);
                    }

                    todoOverlay.appendChild(deleteTodo);    
                }
            });        

        sub.appendChild(select);
        sub.appendChild(center);
        center.appendChild(name);
        center.appendChild(notes);
        center.appendChild(dateandtime);
        dateandtime.appendChild(date);
        dateandtime.appendChild(time);
        sub.appendChild(Options); // append select, name, date, Options to TO-DO item, 
        divider.appendChild(sub);
        addSection.parent().prepend(divider); // append the whole thing to join up wit the title that was preivously added

        // If there's no date, don't display
        if(date.value == "" && !newToDoBool){
            dateandtime.style.display = "none";
        }
        else{
            dateandtime.style.display = "inline-block";
        }
        // If there's no time, don't display
        if(time.value == "" && !newToDoBool){
            time.style.display = "none";
        }
        // If there's no time, don't display
        if(notes.value == ""){
            notes.style.display = "none";
        }
        if(newToDoBool){
            name.focus();
        }
    }
});



// Temporary these are here, was running into errors putting these into separate files

// controller for the completed section area
app.controller('completed', function($scope, todoStorage, NotifyingService, NotifyUndo) {

    $scope.todoStorage = todoStorage;

    $scope.$watch('todoStorage.data', function() {
        $scope.todoList = $scope.todoStorage.data;
    });

    $scope.$watch('todoStorage.persistentInformation', function(){
        $scope.extraInformation = $scope.todoStorage.persistentInformation;
    });

    $scope.todoStorage.findAll2(function(moreData){
        // just gets the information
        $scope.displayAllCompleted();
    });

    NotifyingService.subscribe($scope, function somethingChanged(event, info) {
        $scope.extraInformation = info;
        $scope.displayAllCompleted(); // refresh page   
    });

    NotifyUndo.subscribe($scope, function doWork(event, data){
        $scope.extraInformation.completedStuff = data;
        $scope.displayAllCompleted();
    })

    $scope.removeAll = function(){
        todoStorage.removeAllCompleted();
    }
 
    $scope.displayAllCompleted = function(){

        $("#CompletedView2").empty(); // Clear everything that is displayAllCompleted


        if($scope.extraInformation.completedStuff == null || $scope.extraInformation.completedStuff.length == 0 ){
            // No date to display
        } else { 
            for(var i=$scope.extraInformation.completedStuff.length-1; i >= 0; i--){
    
                 var container = document.createElement("div");
                 container.className = "SubToDo row";

                 var left = document.createElement("div");
                 left.className = "col-xs-10 vcenter";
                 var right = document.createElement("div");
                 right.className = "col-xs-1 col-xs-offset-1 vcenter"
                 var completedCategory = document.createElement("div"); // create new elements for each of the categories in a 
                 completedCategory.className = "row";
                 var completedName = document.createElement("div");
                 completedName.className = "row";
                 var completedNotes= document.createElement("div");
                 completedNotes.className = "row";
                 var completedDateAndTime = document.createElement("div");
                 completedDateAndTime.className = "CompleteDateTime row";
                 var completedDate = document.createElement("div");
                 completedDate.className = "CompleteDate";
                 var completedTime= document.createElement("div");
                 completedDate.className = "CompleteTime";
                 var deleteOption = document.createElement("div");
                 deleteOption.className = "deleteCompleted";

                 completedCategory.innerHTML = $scope.extraInformation.completedStuff[i].category;
                 completedName.innerHTML = $scope.extraInformation.completedStuff[i].name;
                 completedDate.innerHTML = $scope.formatDate($scope.extraInformation.completedStuff[i].date);
                 completedTime.innerHTML = $scope.formatTime($scope.extraInformation.completedStuff[i].time);
                 completedNotes.innerHTML = $scope.extraInformation.completedStuff[i].notes;
                 deleteOption.innerHTML = "<i class='fa fa-remove'></i>";

                 completedCategory.className = "CompleteCategory";
                 completedName.className = "CompleteName";
                 completedDate.className = "CompleteDate";
                 completedTime.className = "CompleteTime";
                 completedNotes.className = "CompleteNotes";


                 container.appendChild(left);
                 container.appendChild(right);
                 if($scope.extraInformation.completedStuff[i].category != ""){
                    left.appendChild(completedCategory);
                 }
                 if($scope.extraInformation.completedStuff[i].name != ""){
                    left.appendChild(completedName);
                 }
                 if($scope.extraInformation.completedStuff[i].notes != ""){
                    left.appendChild(completedNotes);
                 }
                 if(($scope.extraInformation.completedStuff[i].date != "")){
                 left.appendChild(completedDateAndTime);
                 completedDateAndTime.appendChild(completedDate);
                 }
                 if($scope.extraInformation.completedStuff[i].time != ""){
                 completedDateAndTime.appendChild(completedTime);
                 }
                 right.appendChild(deleteOption);

                 $(deleteOption).bind( "click", {index: i}, function(event) { 
                    todoStorage.removeCompleted(event.data.index); // remove from memory
                    $scope.displayAllCompleted(); // refresh page
                });
                 $("#CompletedView2").append(container);
           }             
        }
    }

    // function used to format date month/day/year
    $scope.formatDate = function(val){
        if(val==""){
            return date;
        }
        var date = new Date(val);
        var day = date.getDate() + 1; // ?!?!? i have no idea why but I have to add 1 for some reason 
        var month = date.getMonth() + 1;  // ?!?!? i have no idea why but I have to add 1 for some reason 
        var year =  date.getFullYear();  // ?!?!? year is fine for some reason 
        return month + "/" + day + "/" + year;
    }

    $scope.formatTime = function(time){
        if(time == ""){
            return time;
        }
        var arr = time.split(":");
        var hours = arr[0];
        var minutes = arr[1];
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }


});

app.controller('setting', function($scope, todoStorage, NotifyingColorService, NotifyingColorService2 ){
    $scope.colorCode = document.getElementById("topBar").style.backgroundColor; // default color;

    $scope.colorCode = "0a97f5";
    $scope.tabCode = "6cc1f9";
    $scope.themeID = 0;

    $scope.enableReminders;
    $scope.dataSelect;

    $scope.doSomething = function(){
        var notificationSound;
        if($scope.dataSelect == "oldSpice.mp3"){
            notificationSound = new Audio('notificationSounds/oldSpice.mp3');
            notificationSound.play();
            todoStorage.changeNotificationSound('oldSpice.mp3');
        }
        if($scope.dataSelect == "chime.mp3"){
            notificationSound = new Audio('notificationSounds/chime.mp3');
            notificationSound.play();
            todoStorage.changeNotificationSound('chime.mp3');
        }
        if($scope.dataSelect == "bliss.mp3"){
            notificationSound = new Audio('notificationSounds/bliss.mp3');
            notificationSound.play();
            todoStorage.changeNotificationSound('bliss.mp3');
        }
        if($scope.dataSelect == "notify.mp3"){
            notificationSound = new Audio('notificationSounds/notify.mp3');
            notificationSound.play();
            todoStorage.changeNotificationSound('notify.mp3');
        }
    }

    $scope.$watch('todoStorage.persistentInformation', function(){
        $scope.extraInformation = todoStorage.persistentInformation;
        $scope.themeID = $scope.extraInformation.topColor;
        $scope.dataSelect = todoStorage.persistentInformation.notificationSound;
        if ($scope.themeID == "0"){
            $scope.update();
        }
        else if($scope.themeID == "1"){
            $scope.update1();
        } else if ($scope.themeID == "2"){
            $scope.update2();
        } else {
            $scope.update3();
        } 
    });

    NotifyingColorService2.subscribe($scope, function somethingChanged(event, info, setting, notificationSound) {
        $scope.themeID = info;
        $scope.enableReminders = setting;
        $scope.dataSelect = notificationSound;
        if ($scope.themeID == 0){
            $scope.update();
        } else if($scope.themeID == 1){
            $scope.update1();
        } else if ($scope.themeID == 2){
            $scope.update2();
        } else if($scope.themeID == 3){
            $scope.update3();
        }
        else {
            $scope.update4();
        } 
    }); 
    $scope.updateSetting = function(){
        todoStorage.changeReminderSetting();
    }

    $scope.updateColors = function(){
        $('.col-xs-4.tab.noselect.active').css("background-color", "#" + $scope.tabCode);
        $('#topBar').css("background-color", "#" + $scope.colorCode); // update colors
        $('#topBar2').css("background-color", "#" + $scope.colorCode); // update colors
        $('footer').css("background-color", "#" + $scope.colorCode); // update colors 
        $('.newCourse').css("background-color", "#" + $scope.colorCode); // update colors    
        NotifyingColorService.notify($scope.tabCode);
        todoStorage.updateColor($scope.themeID);
    }

    $scope.updateColors();

    $scope.update = function(){  // theme #1 - blue
        $scope.colorCode = "0a97f5";
        $scope.tabCode = "6cc1f9";
        $scope.themeID = 0;
        $scope.updateColors();
    }
    $scope.update1 = function(){ // theme #2 - gold
        $scope.colorCode = "ffd700";
        $scope.tabCode = "ffe866";
        $scope.themeID = 1;
        $scope.updateColors();
    }
    $scope.update2 = function(){ // theme #3 - red
        $scope.colorCode = "d6391a";
        $scope.tabCode = "eb7760"; 
        $scope.themeID = 2;
        $scope.updateColors();
    }
    $scope.update3 = function(){ // theme #4 - green
        $scope.colorCode = "2db931";
        $scope.tabCode = "6fdc73";
        $scope.themeID = 3;
        $scope.updateColors();
    }
    $scope.update4 = function(){ // theme #5 - pink
        $scope.colorCode = "ff5bff";
        $scope.tabCode = "ff99ff";
        $scope.themeID = 4;
        $scope.updateColors();
    }

});

// controller for the calendar section area
app.controller('calendar', function($scope,$compile,uiCalendarConfig, todoStorage, NotifyingServiceCalendar) {

    $scope.todoStorage = todoStorage;
    var calendarRendered = false;
    var instantiateRemoved = false;

    $scope.$watch('todoStorage.data', function() {
        $scope.todoList = $scope.todoStorage.data;
    });

    $("#CalendarTab").bind('click', function(){
        calendarRendered = true;

        if($scope.events.length > 1 && !instantiateRemoved){
            $scope.remove(0);
            instantiateRemoved = true;
            uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
        }
    });

    var newDate = new Date();
    var d = newDate.getDate();
    var m = newDate.getMonth();
    var y = newDate.getFullYear();
    $scope.count = 0;

    $scope.events = [];
    $scope.events.push({title: 'Day One', category: "Start of Month", notes: "", start: new Date(y, m, 1), backgroundColor: "#FFFFFF", stick: false});

    $scope.todoStorage.findAll(function(data){
        $scope.todoList = data;
        $scope.$apply();
        angular.forEach($scope.todoList, function(item){ // at the start of loading a page, we itterate over the existing data and create HTML elements for each and add to the DOM
            for(var j=0; j < item.subToDo.length; j++){
                $scope.addEvent(item.subToDo[j], item.color, item);
                $scope.count = $scope.count + 1;         
            }
        })
    });

    NotifyingServiceCalendar.subscribe($scope, function somethingChanged(event, data) {
        $scope.syncCalendar(data); 
    });

    $scope.syncCalendar = function(data){
        // If we haven't opened the calendar, we shouldn't rerender

        // If we've already opened the calendar

        var functionName = data.functionName;
        if(functionName == "removeSubToDo"){
            var syncData = data.data;
            for(var j = 0; j < $scope.events.length; j++){
                if(syncData.uniqueHash == $scope.events[j].hash){
                    $scope.remove(j);
                    if(calendarRendered){
                        uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
                    }
                }
            }
        }
        else if(functionName == "changeSubToDoName"){
            var syncData = data.data;
            for(var j = 0; j < $scope.events.length; j++){
                if(syncData.uniqueHash == $scope.events[j].hash){
                    $scope.events[j].title = syncData.name;
                    if(calendarRendered){
                        uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
                    }
                }
            }
        }
        else if(functionName == "changeSubToDoNotes"){
            var syncData = data.data;
            for(var j = 0; j < $scope.events.length; j++){
                if(syncData.uniqueHash == $scope.events[j].hash){
                    $scope.events[j].notes = syncData.notes;
                    if(calendarRendered){
                        var tempName = $scope.events[j].title;
                        $scope.events[j].title = "temp";
                        uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
                        $scope.events[j].title = tempName;
                        uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
                    }
                }
            }
        }
        else if(functionName == "changeSubToDoDate"){
            var syncData = data.data;
            for(var j = 0; j < $scope.events.length; j++){
                if(syncData.uniqueHash == $scope.events[j].hash){
                    var eventDate = new Date(syncData.date);
                    eventDate.setDate(eventDate.getDate() + 1);
                    $scope.setTime(eventDate, syncData.time);
                    $scope.events[j].start = eventDate;
                    if(calendarRendered){
                            uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
                    }
                }
            }
        }
        else if(functionName == "changeSubToDoTime"){
            var syncData = data.data;
            for(var j = 0; j < $scope.events.length; j++){
                if(syncData.uniqueHash == $scope.events[j].hash){
                    var eventDate = new Date(syncData.date);
                    eventDate.setDate(eventDate.getDate() + 1);
                    $scope.setTime(eventDate, syncData.time);
                    $scope.events[j].start = eventDate;
                    if(calendarRendered){
                        uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
                    }
                }
            }
        }
        else if(functionName == "changeCategoryName"){
           var syncData = data.data;
            for(var j = 0; j < $scope.events.length; j++){
                if(syncData.uniqueHash == $scope.events[j].hash){
                    $scope.events[j].category = data.categoryName;
                    if(calendarRendered){
                        var tempName = $scope.events[j].title;
                        $scope.events[j].title = "temp";
                        uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
                        $scope.events[j].title = tempName;
                        uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
                    }
                }
            }      
        }
        else if(functionName == "changeCategoryColor"){
            var syncData = data.data;
            for(var j = 0; j < $scope.events.length; j++){
                if(syncData.uniqueHash == $scope.events[j].hash){
                    $scope.events[j].backgroundColor = "#" + data.categoryColor;
                    if(calendarRendered){
                        var tempName = $scope.events[j].title;
                        $scope.events[j].title = "temp";
                        uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
                        $scope.events[j].title = tempName;
                        uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents');
                    }
                }
            }         
        }
            else if(functionName == "addSubToDo"){
                var syncData = data.data;
                var eventDate = new Date(y - 1, m, d);
                    $scope.events.push({
                    category: data.categoryName,
                    title: syncData.name,
                    start: eventDate,
                    notes: syncData.notes,
                    hash: syncData.uniqueHash,
                    backgroundColor: "#" + data.color,
                    stick: true
                });
                if(calendarRendered){
                    uiCalendarConfig.calendars["calendar"].fullCalendar('refetchEvents'); 
                }
            }
        }


    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
                jsEvent.stopPropagation();
                var calendarOverlay = document.getElementById("CalendarOverlay");

                // Closes options if they're open
                if(calendarOverlay.style.display == "inline-block"){
                    calendarOverlay.innerHTML = ""; // clear contents of overlay
                    calendarOverlay.style.display = "none";  // close overlay
                }
                // Otherwise, sets up menu
                else{
                    calendarOverlay.style.display = "inline-block";

                    var close = document.createElement("div"); // The button to close overlay
                    close.className = "text-right";
                    close.innerHTML = "<i class='closeButton fa fa-lg fa-remove'></i>";
                    
                    $(close).bind('click', function(){
                        calendarOverlay.innerHTML = "";
                        calendarOverlay.style.display = "none";
                    });

                    var category = document.createElement('div');
                    category.className = "row calRow calCat";
                    category.innerHTML = date.category;

                    var name = document.createElement('div'); // displays name
                    name.className = "row calRow";
                    name.innerHTML = date.title;

                    var note = document.createElement("div"); // displays notes
                    note.className = 'row calNotes container';
                    note.innerHTML = date.notes;

                    var dateandtime = document.createElement('div'); // displays date and time
                    dateandtime.className = "SubDateTime calRow row";
                    // accounts for change of date
                    console.log(date.start);
                    if(date.start._isUTC){
                        date.start._d.setHours(date.start._d.getHours() + 4);
                        date.start._isUTC = false;
                    }
                    var temp = new Date(date.start._d);
                    var myDate = document.createElement('input');
                    myDate.type = 'date';
                    myDate.disabled = "readonly";
                    var year = temp.getFullYear();
                    var month = temp.getMonth()+1;
                    if(month < 10){
                        month = "0"+month;
                    }
                    var day = temp.getDate();
                    if(day < 10){
                        day = "0"+day;
                    }
                    var time = document.createElement('input');
                    time.type = 'time';
                    time.disabled = "readonly";
                    var hours = temp.getHours();
                    if(hours < 10){
                        hours = "0" + hours;
                    }
                    var minutes = temp.getMinutes();
                    if(minutes < 10){
                        minutes = "0"+ minutes;
                    }
                    myDate.value = year + "-" + month + "-" + day;
                    myDate.className = "date";
                    time.value = hours + ":" + minutes;
                    time.className = "time";
                    
                    calendarOverlay.appendChild(close);
                    calendarOverlay.appendChild(category);
                    calendarOverlay.appendChild(name);
                    if(note.innerHTML != ""){
                        calendarOverlay.appendChild(note);
                    }
                    calendarOverlay.appendChild(dateandtime);
                    dateandtime.appendChild(myDate);
                    if(time.value == ""){
                        time.value = "00:00";
                    }
                    dateandtime.appendChild(time);
        }
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
    $scope.addEvent = function(subToDo, color, category) {
      var eventDate = new Date(subToDo.date);
      eventDate.setDate(eventDate.getDate() + 1);
      $scope.setTime(eventDate, subToDo.time);
      $scope.events.push({
        title: subToDo.name,
        start: eventDate,
        notes: subToDo.notes,
        hash: subToDo.uniqueHash,
        category: category.content,
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

        var hours = time.substring(0, index);
        var minutes = time.substring(index + 1, time.length);

        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds("00");
        return date;
    }
    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: 463,
        editable: false,
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