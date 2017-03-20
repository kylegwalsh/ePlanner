$(document).ready(function(){
    $('.tab').on('click', function(){
        $('.tab.active').removeClass('active');
        $(this).addClass('active');
    });

    $('html').on('click', function() {
        $('.filterMenu').hide();
    });

    $('.filterMenu').on('click', function(e){
        e.stopPropagation();
    });

    $('#filterButton').on('click', function(e){
        e.stopPropagation();
        $('.filterMenu').toggle();
    });
});

function loadToDo() {
  if(!$('#ToDoTab').hasClass('active')){
    $("#ToDoView").show();
    $("#CompletedView").hide();
    $('#CalendarView').hide();
  }
}
function loadCompleted() {
  if(!$('#CompletedTab').hasClass('active')){
    $("#ToDoView").hide();
    $("#CompletedView").show();
    $('#CalendarView').hide();
  }
}
function loadCalendar() {
  if(!$('CalendarTab').hasClass('active')){
    $("#ToDoView").hide();
    $("#CompletedView").hide();
    $('#CalendarView').show();
    $('.fc-today-button').trigger('click');
  }
}
function loadSettings(){
  $("#MainPage").hide();
  $("#SettingsPage").show();
}
function returntoMain(){
  $("#MainPage").show();
  $("#SettingsPage").hide();
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#ToDoTab').addEventListener('click', loadToDo);
  document.querySelector('#CompletedTab').addEventListener('click', loadCompleted);
  document.querySelector('#CalendarTab').addEventListener('click', loadCalendar);
  document.querySelector('#settingsButton').addEventListener('click', loadSettings);
  document.querySelector('#return').addEventListener('click',returntoMain);
});
