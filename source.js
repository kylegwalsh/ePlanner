$(document).ready(function(){
    chrome.browserAction.setBadgeText({text: ""});

    $('.tab').on('click', function(){
        $('.tab.active').removeClass('active');
        $(this).addClass('active');
    });

    $('.exitButton').on('click', function(){
        window.close();
    });

    $('#MainPage').on('click', function() {
        document.getElementById('CategoryOptionsOverlay').innerHTML = "";
        document.getElementById('CategoryOptionsOverlay').style.display = "none";
        document.getElementById('TodoOptionsOverlay').innerHTML = "";
        document.getElementById('TodoOptionsOverlay').style.display = "none";
    });

    $('#CategoryOptionsOverlay').on('click', function(e){
      e.stopPropagation();
    });

    $('#CategoryOptionsOverlay').on('click', function(e){
      e.stopPropagation();
    });

    $('.jscolor').on('click', function(e){
      e.stopPropagation();
    });
});

'use strict';
app.controller('TabController', function($scope, todoStorage, NotifyingColorService) {

    $scope.loadSettings = function(){
        $("#MainPage").hide();
        $("#SettingsPage").show();
    }
    $scope.returntoMain = function(){
        $("#MainPage").show();
        $("#SettingsPage").hide();
    }
    $scope.loadCalendar = function(){
          if(!$('CalendarTab').hasClass('active')){
            $('.col-xs-4.tab.noselect').css("background-color", "#" +$scope.colorInfo);
            $("#ToDoView").hide();
            $("#CompletedView").hide();
            $('#CalendarView').show();
            $('.fc-today-button').trigger('click');
          setTimeout(function(){ 
              $('.col-xs-4.tab.noselect').css("background-color", "#" + "FFFFFF");
              $('.col-xs-4.tab.noselect.active').css("background-color", "#" + $scope.colorInfo);
           }, 10);
          }     
    }
    $scope.loadCompleted = function(){
        if(!$('#CompletedTab').hasClass('active')){
            $("#ToDoView").hide();
            $("#CompletedView").show();
            $('#CalendarView').hide();
          setTimeout(function(){ 
              $('.col-xs-4.tab.noselect').css("background-color", "#" + "FFFFFF");
              $('.col-xs-4.tab.noselect.active').css("background-color", "#" + $scope.colorInfo);
           }, 10);
          }
    }
    $scope.loadToDo = function(){
          if(!$('#ToDoTab').hasClass('active')){
          $("#ToDoView").show();
          $("#CompletedView").hide();
          $('#CalendarView').hide();
          setTimeout(function(){ 
              $('.col-xs-4.tab.noselect').css("background-color", "#" + "FFFFFF");
              $('.col-xs-4.tab.noselect.active').css("background-color", "#" + $scope.colorInfo);
           }, 10);
        }
    }

    $scope.setUpOnce = function(){
      $( "#ToDoTab" ).on( "click", function() {
        $scope.loadToDo();
      });
      $( "#CompletedTab" ).on( "click", function() {
        $scope.loadCompleted();
      });
      $( "#CalendarTab" ).on( "click", function() {
        $scope.loadCalendar();
      });
      $( "#settingsButton" ).on( "click", function() {
        $scope.loadSettings();
      });
      $( "#return" ).on( "click", function() {
        $scope.returntoMain();
      });
    }
 
    NotifyingColorService.subscribe($scope, function somethingChanged(event, info) {
        $scope.colorInfo = info;
    }); 

    $scope.setUpOnce();

});