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
  $http.get('/api/leagues').then(function(response){
    $scope.leagues = response.data;
  });
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

app.controller('EventsController', ['$scope', '$http', function($scope, $http){

  $http.get('/api/events').then(function(response){
    $scope.events = response.data;
  });

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

app.controller('UsersController', ['$scope', '$http', function($scope, $http){
  $http.get('/api/users').then(function(response){
    $scope.users = response.data;
  });
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
