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
    });

    $scope.add = function() {
        todoStorage.add($scope.newContent);
        $scope.newContent = '';
    }

    $scope.remove = function(todo) {
        todoStorage.remove(todo);
    }

    $scope.removeAll = function() {
        todoStorage.removeAll();
    }

    $scope.toggleCompleted = function() {
        todoStorage.sync();
    }

});

app.controller('completed', function($scope) {
    $scope.firstName = "John";
    $scope.lastName = "Doe";
});


app.controller('calendar', function($scope) {
    $scope.firstName = "John";
    $scope.lastName = "Doe";
});

app.controller('settings', function($scope) {
    $scope.firstName = "John";
    $scope.lastName = "Doe";
});