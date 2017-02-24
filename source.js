function loadToDo() {
    document.getElementById("Main").innerHTML = "This is going to be the Todo";
}
function loadCompleted() {
    document.getElementById("Main").innerHTML = "Completed Section!!!";
}
function loadCalendar() {
    document.getElementById("Main").innerHTML = "Calendar Section!!!";
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#To-do').addEventListener('click', loadToDo);
  document.querySelector('#Completed').addEventListener('click', loadCompleted);
  document.querySelector('#Calendar').addEventListener('click', loadCalendar);
});
