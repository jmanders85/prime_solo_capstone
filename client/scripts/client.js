var app = angular.module('sheepsheadApp', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $routeProvider
    .when('/', {
      templateUrl: 'views/home.html',
      controller: 'HomeController'
    })
    .when('/leagues', {
      templateUrl: 'views/leagues.html',
      controller: 'LeaguesController'
    })
    .when('/events', {
      templateUrl: 'views/events.html',
      controller: 'EventsController'
    })
    .when('/users', {
      templateUrl: 'views/users.html',
      controller: 'UsersController'
    });

  $locationProvider.html5Mode(true);
}]);

app.controller('MainController', ['$scope', '$http', function($scope, $http) {
  $scope.leagues = [];
  $scope.events = [];
  $scope.users = [];

  $http.get('/api/leagues').then(function(response){
    $scope.leagues = response.data;
  });

  $http.get('/api/events').then(function(response){
    $scope.events = response.data;
  });

  $http.get('/api/users').then(function(response){
    $scope.users = response.data;
  });
}]);

app.controller('HomeController', ['$scope', '$http', function($scope, $http) {

}]);

app.controller('LeaguesController', ['$scope', '$http', function($scope, $http){

}]);

app.controller('EventsController', ['$scope', '$http', function($scope, $http){

}]);

app.controller('UsersController', ['$scope', '$http', function($scope, $http){

}]);
