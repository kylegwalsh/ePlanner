$(document).ready(function(){
    $('.tab').on('click', function(){
        $('.tab.active').removeClass('active');
        $(this).addClass('active');
    });

    $('#filterButton').on('click', function(){
        $('.filterMenu').toggle();
    });

    $('html').on('click', function() {
        $('.filterMenu').hide();
    });

    $('.filterMenu').on('click', function(e){
        e.stopPropagation();
    });

    $('#filterButton').on('click', function(e){
        e.stopPropagation();
    });
});

function loadToDo() {
  $("#ToDoView").show();
  $("#CompletedView").hide();
  $('#CalendarView').hide();
}
function loadCompleted() {
  $("#ToDoView").hide();
  $("#CompletedView").show();
  $('#CalendarView').hide();
}
function loadCalendar() {
  $("#ToDoView").hide();
  $("#CompletedView").hide();
  $('#CalendarView').show();
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
