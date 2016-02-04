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
    })
    .when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginController'
    });

  $locationProvider.html5Mode(true);
}]);

app.controller('MainController', ['$scope', '$http', function($scope, $http) {
  $scope.leagues = [];
  $scope.events = [];
  $scope.users = [];
  $scope.hands = [];
  $scope.event = {};
  $scope.admin = {};

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

  $scope.showEventDetail = function(id) {
    $http.get('/api/events/' + id).then(function(response){
      $scope.event = response.data[0];
    });
    // $http.get('/api/hands/' + id).then(function(response){
    //   $scope.hands = response.data;
    //   console.log($scope.hands);
    // });
  };

  $scope.clearEvent = function() {
    $scope.hands = [];
    $scope.event = {};
  };
}]);

app.controller('UsersController', ['$scope', '$http', function($scope, $http){

}]);

app.controller('LoginController', ['$scope', '$http', function($scope, $http){
  $scope.username = '';
  $scope.password = '';
  $scope.loginFailed = 'Login Failed';
  $scope.showFailedMessage = false;

  $scope.login = function() {
    $scope.showFailedMessage = false;
    $http.post('/login', {"username": $scope.username, "password": $scope.password}).then(function(response){
      if(response.data.username) {
        $scope.admin.username = response.data.username;
      } else {
        $scope.showFailedMessage = true;
      }
    });
  };
}]);
