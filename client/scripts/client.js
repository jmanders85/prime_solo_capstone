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
    .when('/createLeague', {
      templateUrl: 'views/createLeague.html',
      controller: 'CreateLeagueController'
    })
    .when('/events', {
      templateUrl: 'views/events.html',
      controller: 'EventsController'
    })
    .when('/createEvent', {
      templateUrl: 'views/createEvent.html',
      controller: 'CreateEventController'
    })
    .when('/users', {
      templateUrl: 'views/users.html',
      controller: 'UsersController'
    })
    .when('/createUser', {
      templateUrl: 'views/createUser.html',
      controller: 'CreateUserController'
    })
    .when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginController'
    });

  $locationProvider.html5Mode(true);

}]);

app.controller('HomeController', ['$scope', '$http', 'SheepsheadService', function($scope, $http, SheepsheadService) {

  SheepsheadService.getLeagues();
  SheepsheadService.getEvents();
  SheepsheadService.getUsers();

}]);

app.controller('LeaguesController', ['$scope', '$http', 'SheepsheadService', function($scope, $http, SheepsheadService){

  SheepsheadService.getLeagues();
  $scope.leagues = SheepsheadService.data.leagues;
  $scope.league = {};

  $scope.showLeagueDetail = function(id) {
    $http.get('/api/leagues/' + id).then(function(response){
      $scope.league = response.data[0];
    });
  };

  $scope.clearLeague = function() {
    $scope.league = {};
  };

}]);

app.controller('CreateLeagueController', ['$scope', '$http', '$location', function($scope, $http, $location){

  $scope.newLeagueName = '';

  $scope.postLeague = function() {
    $http.post('/api/leagues', {"name": $scope.newLeagueName})
      .then(function(response){
        if (response.status === 200) {
          $location.path('/leagues');
        } else {
          console.log("ERROR");
        }
      });
  };

}]);

app.controller('EventsController', ['$scope', '$http', 'SheepsheadService', function($scope, $http, SheepsheadService){

  SheepsheadService.getEvents();
  $scope.events = SheepsheadService.data.events;
  $scope.event = {};

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

app.controller('CreateEventController', ['$scope', '$http', '$location', function($scope, $http, $location) {

  $scope.newEventName = '';
  $scope.newEventDate = new Date();
  $scope.newEventLeagueID = 1;
  $scope.newEventPlayerCount = 3;
  $scope.newEventPlayers = [];

  $scope.range = function(n) {
    return new Array(n);
  };

  $scope.postEvent = function() {
    var newEventPlayersAsInts = $scope.newEventPlayers.map(Number);
    $http.post('/api/events', {"name": $scope.newEventName, "date": $scope.newEventDate, "league_id": $scope.newEventLeagueID, "players": newEventPlayersAsInts})
      .then(function(response){
        if (response.status === 200) {
          $location.path('/events');
        } else {
          console.log("ERROR");
        }
      });
  };

}]);

app.controller('UsersController', ['$scope', '$http', 'SheepsheadService',  function($scope, $http, SheepsheadService){

  SheepsheadService.getUsers();
  $scope.users = SheepsheadService.data.users;
  $scope.user = {};

  $scope.showUserDetail = function(id) {
    $http.get('/api/users/' + id).then(function(response){
      $scope.user = response.data[0];
    });
  };

  $scope.clearUser = function() {
    $scope.user = {};
  };

}]);

app.controller('CreateUserController', ['$scope', '$http', '$location', function($scope, $http, $location) {

  $scope.newUserName = '';

  $scope.postUser = function() {
    $http.post('/api/users', {"name": $scope.newUserName})
      .then(function(response){
        if (response.status === 200) {
          $location.path('/users');
        } else {
          console.log("ERROR");
        }
      });
  };

}]);

app.controller('LoginController', ['$scope', '$http', '$location', function($scope, $http, $location){

  $scope.username = '';
  $scope.password = '';
  $scope.loginFailed = 'Login Failed';
  $scope.showFailedMessage = false;
  $scope.admin = {};

  $scope.login = function() {
    $scope.showFailedMessage = false;
    $http.post('/login', {"username": $scope.username, "password": $scope.password}).then(function(response){
      if(response.data.username) {
        $scope.admin = response.data;
      } else {
        $scope.showFailedMessage = true;
      }
    });
  };

  $scope.createLeague = function() {
    $location.path('/createLeague');
  };

  $scope.createEvent = function() {
    $location.path('/createEvent');
  };

  $scope.createUser = function() {
    $location.path('/createUser');
  };
  
}]);

app.factory('SheepsheadService', ['$http', function($http){

  var data = {};

  var getLeagues = function() {
    $http.get('/api/leagues').then(function(response){
      data.leagues = response.data;
    });
  };

  var getEvents = function() {
    $http.get('/api/events').then(function(response){
      data.events = response.data;
    });
  };

  var getUsers = function() {
    $http.get('/api/users').then(function(response){
      data.users = response.data;
    });
  };

  return {
    data: data,
    getLeagues: getLeagues,
    getEvents: getEvents,
    getUsers: getUsers
  };

}]);
