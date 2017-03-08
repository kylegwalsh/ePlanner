$(document).ready(function(){
    $('.tab').on('click', function(){
        $('.tab.active').removeClass('active');
        $(this).addClass('active');
    });
});

function loadToDo() {
  $("#FIRST").show();
  $("#SECOND").hide();
  $('#THIRD').hide();
}
function loadCompleted() {
  $("#FIRST").hide();
  $("#SECOND").show();
  $('#THIRD').hide();
}
function loadCalendar() {
  $("#FIRST").hide();
  $("#SECOND").hide();
  $('#THIRD').show();
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#To-do').addEventListener('click', loadToDo);
  document.querySelector('#Completed').addEventListener('click', loadCompleted);
  document.querySelector('#Calendar').addEventListener('click', loadCalendar);
});
