function loadToDo() {
    document.getElementById('Main').innerHTML = 'This is going to be the Todo';
    document.querySelector('#Completed').className = 'tab';
    document.querySelector('#Calendar').className = 'tab';
    document.querySelector('#To-do').className = 'tab active';
}
function loadCompleted() {
    document.getElementById('Main').innerHTML = "Completed Section!!!";
    document.querySelector('#To-do').className = 'tab';
    document.querySelector('#Calendar').className = 'tab';
    document.querySelector('#Completed').className = 'tab active';
}
function loadCalendar() {
    document.getElementById('Main').innerHTML = 'Calendar Section!!!';
    document.querySelector('#To-do').className = 'tab';
    document.querySelector('#Completed').className = 'tab';
    document.querySelector('#Calendar').className = 'tab active';
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#To-do').addEventListener('click', loadToDo);
  document.querySelector('#Completed').addEventListener('click', loadCompleted);
  document.querySelector('#Calendar').addEventListener('click', loadCalendar);
});
