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
    .when('/hands', {
      templateUrl: 'views/hands.html',
      controller: 'HandsController'
    })
    .when('/createEvent', {
      templateUrl: 'views/createEvent.html',
      controller: 'CreateEventController'
    })
    .when('/addHands', {
      templateUrl: 'views/addHands.html',
      controller: 'AddHandsController'
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

app.controller('HeaderController', ['$scope', 'SheepsheadService', function($scope, SheepsheadService){
  SheepsheadService.getLeagues();
  SheepsheadService.getEvents();
  SheepsheadService.getUsers();

  $scope.trump = 0;

  $scope.clubsSpadesClick = function() {
    if ($scope.trump === 0 || $scope.trump == 1 || $scope.trump == 2) {
      $scope.trump++;
    } else {
      $scope.trump = 0;
    }
  };

  $scope.diamondsHeartsClick = function() {
    if ($scope.trump == 3 || $scope.trump == 4) {
      $scope.trump++;
    } else {
      $scope.trump = 0;
    }
  };
}]);

app.controller('HomeController', ['$scope', '$http', 'SheepsheadService', function($scope, $http, SheepsheadService) {



  $scope.topScores = [];
  $scope.leasters = [];
  $scope.mosters = [];
  $scope.picksAndWins = [];
  $scope.blitzers = [];
  $scope.handsPlayed = [];
  $scope.positionData = [];
  $scope.positionStats = [];
  $scope.data = SheepsheadService.data;
  $scope.leagueFilter = '';

  $scope.changeStartDate = function() {
    if (Date.parse($scope.data.startDate) && $scope.data.startDate < $scope.data.endDate) {
      $scope.editStart = !$scope.editStart;
      $scope.reloadScores();
    }
  };

  $scope.changeEndDate = function() {
    if (Date.parse($scope.data.endDate) && $scope.data.startDate < $scope.data.endDate) {
      $scope.editEnd = !$scope.editEnd;
      $scope.reloadScores();
    }
  };

  $scope.reloadScores = function() {
    $scope.positionStats = [
      {
        "position": "First",
        "handsWon": 0,
        "handsPicked": 0,
      },
      {
        "position": "Middle",
        "handsWon": 0,
        "handsPicked": 0
      },
      {
        "position": "Dealer",
        "handsWon": 0,
        "handsPicked": 0
      }
    ];

    var routeParam = '/' + $scope.leagueFilter + '?startDate=' + $scope.data.startDate + '&endDate=' + $scope.data.endDate;

    $http.get('/api/events_users/topScores' + routeParam).then(function(response){
      $scope.topScores = response.data;
    });

    $http.get('/api/hands/leasters' + routeParam).then(function(response){
      $scope.leasters = response.data;
    });

    $http.get('/api/hands/mosters' + routeParam).then(function(response){
      $scope.mosters = response.data;
    });

    $http.get('/api/hands/winLoss' + routeParam).then(function(response){
      $scope.picksAndWins = response.data;

      for (var i = 0; i < $scope.picksAndWins.length; i++){
        $scope.picksAndWins[i].winRatio = Math.round(($scope.picksAndWins[i].hands_won / $scope.picksAndWins[i].hands_picked) * 1000) / 1000;
        $scope.picksAndWins[i].record = "" + $scope.picksAndWins[i].hands_won + " - " + ($scope.picksAndWins[i].hands_picked - $scope.picksAndWins[i].hands_won);
      }
      $scope.picksAndWins.sort(function(obj1, obj2){
        return obj2.winRatio - obj1.winRatio;
      });
    });

    $http.get('/api/hands/blitzers' + routeParam).then(function(response){
      $scope.blitzers = response.data;
    });

    $http.get('/api/hands/handsPlayed' + routeParam).then(function(response){
      $scope.handsPlayed = response.data;
    });

    $http.get('/api/hands/positionStats' + routeParam).then(function(response){
      $scope.positionData = response.data;
      for (var i = 0; i < $scope.positionData.length; i++) {
        var firstPosition = parseInt($scope.positionData[i].dealer_position) + 1;
        if (firstPosition > $scope.positionData[i].player_count) firstPosition = 1;

        // This adjusts for modulus data
        if ($scope.positionData[i].dealer_position == "0") $scope.positionData[i].dealer_position = $scope.positionData[i].player_count;

        // How did dealer do?
        if ((($scope.positionData[i].player_count == 3 || $scope.positionData[i].player_count == 5) && $scope.positionData[i].declarers_position == $scope.positionData[i].dealer_position) || (($scope.positionData[i].player_count == 4 || $scope.positionData[i].player_count == 6) && $scope.positionData[i].declarers_position == ($scope.positionData[i].dealer_position - 1 || $scope.positionData[i].player_count))) {
          $scope.positionStats[2].handsPicked++;
          if ($scope.positionData[i].won) $scope.positionStats[2].handsWon++;
        } else if ($scope.positionData[i].declarers_position == firstPosition ) {
          $scope.positionStats[0].handsPicked++;
          if ($scope.positionData[i].won) $scope.positionStats[0].handsWon++;
        } else {
          $scope.positionStats[1].handsPicked++;
          if ($scope.positionData[i].won) $scope.positionStats[1].handsWon++;
        }
      }
      for (var j = 0; j < $scope.positionStats.length; j++){
        $scope.positionStats[j].winRatio = Math.round(($scope.positionStats[j].handsWon / $scope.positionStats[j].handsPicked) * 1000) / 1000;
        $scope.positionStats[j].record = "" + $scope.positionStats[j].handsWon + " - " + ($scope.positionStats[j].handsPicked - $scope.positionStats[j].handsWon);
      }
      $scope.positionStats.sort(function(obj1, obj2){
        return obj2.winRatio - obj1.winRatio;
      });
    });
  };

  $scope.reloadScores();

  $scope.winLossFilter = function(item) {
    return item.hands_picked >= 5;
  };

  $scope.greaterThanZero = function(item) {
    return item.sum > 0;
  };

}]);

app.controller('LeaguesController', ['$scope', '$http', '$location', 'SheepsheadService', function($scope, $http, $location, SheepsheadService){

  $scope.data = SheepsheadService.data;
  $scope.league = {};

  $scope.showLeagueDetail = function(id) {
    $http.get('/api/leagues/' + id).then(function(response){
      $scope.league = response.data[0];
    });
  };

  $scope.eventDetail = function(eventId) {
    SheepsheadService.data.eventDetail = eventId;
    $location.path('/events');
  };

  $scope.clearLeague = function() {
    $scope.league = {};
  };

}]);

app.controller('CreateLeagueController', ['$scope', '$http', '$location', 'SheepsheadService', function($scope, $http, $location, SheepsheadService){

  $scope.newLeagueName = '';
  $scope.working = false;
  $scope.itWorked = false;

  $scope.postLeague = function() {
    $scope.working = true;
    $http.post('/api/leagues', {"name": $scope.newLeagueName})
      .then(function(response){
        if (response.status === 200) {
          $scope.itWorked = true;
          SheepsheadService.getLeagues();
          $location.path('/leagues');
        } else {
          console.log("ERROR");
        }
      });
  };

}]);

app.controller('EventsController', ['$scope', '$http', '$location', 'SheepsheadService', function($scope, $http, $location, SheepsheadService){

  $scope.data = SheepsheadService.data;
  $scope.event = {};
  $scope.eventDetail = SheepsheadService.data.eventDetail;

  $scope.working = function() {
    if (!$scope.data.events || ($scope.eventDetail && !$scope.event.id)) {
      return true;
    }
  };

  $scope.showEventDetail = function(id) {
    $scope.eventDetail = id;
    $http.get('/api/events/' + id).then(function(response){
      $scope.event = response.data[0];
    });
  };

  if (SheepsheadService.data.eventDetail) {
    $scope.showEventDetail(SheepsheadService.data.eventDetail);
    SheepsheadService.data.eventDetail = '';
  }

  $scope.clearEvent = function() {
    $scope.event = {};
    $scope.eventDetail = '';
    SheepsheadService.data.eventDetail = '';
  };

  $scope.handDetail = function(id) {
    SheepsheadService.data.handDetail = id;
    $location.path('/hands');
  };

}]);

app.controller('HandsController', ['$scope', '$http', '$location', 'SheepsheadService', function($scope, $http, $location, SheepsheadService) {
  $scope.handDetailId = SheepsheadService.data.handDetail;

  $scope.hands = [];

  $http.get('/api/hands/' + $scope.handDetailId)
    .then(function(response){
      $scope.hands = response.data;
    }
  );

  $scope.goBackToEvent = function(id) {
    SheepsheadService.data.eventDetail = id;
    $location.path('/events');
  };
}]);

app.controller('CreateEventController', ['$scope', '$http', '$location', 'SheepsheadService', function($scope, $http, $location, SheepsheadService) {

  $scope.data = SheepsheadService.data;
  SheepsheadService.getUsersNoScores();
  $scope.newEventName = '';
  $scope.newEventDate = new Date();
  $scope.newEventLeagueID = 1;
  $scope.newEventPlayerCount = 3;
  $scope.newEventPlayers = [];

  $scope.range = function(n) {
    return new Array(n);
  };

  $scope.postEvent = function() {
    if ($scope.newEventName === '' || $scope.newEventPlayers.length < 3) return false;
    var newEventPlayersAsInts = $scope.newEventPlayers.map(Number);
    $http.post('/api/events', {"name": $scope.newEventName, "date": $scope.newEventDate.toLocaleFormat(), "league_id": $scope.newEventLeagueID, "players": newEventPlayersAsInts})
      .then(function(response){
        if (response.data) {
          SheepsheadService.data.eventNeedingHands = response.data;
          $location.path('/addHands');
        } else {
          console.log("ERROR");
        }
      });
  };

}]);

app.controller('AddHandsController', ['$scope', '$http', '$location', 'SheepsheadService', function($scope, $http, $location, SheepsheadService) {

  $scope.event = {};
  $scope.hands = [];

  var range = function(n) {
    return new Array(n);
  };

  $http.get('/api/events/' + SheepsheadService.data.eventNeedingHands)
    .then(function(response){
      $scope.event = response.data[0];
      $scope.hands[0] = {
        scores: range($scope.event.players.length)
      };
    }
  );

  // Returns a new 2-dimensional array with the scores specific to each hand.  Eg [1, 1, -2], [5, -1, -4], [-1, 2, -1] => [1, 1, -2], [4, -2, -2], [-6, 3, 3]
  function handsToUnits(handsArray) {
    var unitArray = [];
    for (var i = 0; i < handsArray.length; i++) {
      if (i === 0) {
        unitArray[0] = handsArray[i].scores;
      } else {
        unitArray[i] = range(handsArray[i].scores.length);
        for (var j = 0; j < handsArray[i].scores.length; j++) {
          unitArray[i][j] = handsArray[i].scores[j] - handsArray[i-1].scores[j];
        }
      }
    }
    return unitArray;
  }

  function findIndexOfGreatest(array) {
    var greatest;
    var indexOfGreatest;
    for (var i = 0; i < array.length; i++) {
      if (!greatest || array[i] > greatest) {
        greatest = array[i];
        indexOfGreatest = i;
      }
    }
    return indexOfGreatest;
  }

  function findIndexOfLeast(array) {
    var least;
    var indexOfLeast;
    for (var i = 0; i < array.length; i++) {
      if (!least || array[i] < least) {
        least = array[i];
        indexOfLeast = i;
      }
    }
    return indexOfLeast;
  }

  function countPositives(array) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
      if (array[i] > 0) count++;
    }
    return count;
  }

  function countNegatives(array) {
    var count = 0;
    for (var i = 0; i < array.length; i++)  {
      if (array[i] < 0) count++;
    }
    return count;
  }

  function handMultiplyer(rawHandObject) {
    var mult = 1;
    if (rawHandObject.bqb) mult*=2;
    if (rawHandObject.rqb) mult*=2;
    if (rawHandObject.bjb) mult*=2;
    if (rawHandObject.rjb) mult*=2;
    if (rawHandObject.crack) mult*=2;
    if (rawHandObject.bqbc) mult*=2;
    if (rawHandObject.rqbc) mult*=2;
    if (rawHandObject.bjbc) mult*=2;
    if (rawHandObject.rjbc) mult*=2;
    if (rawHandObject.recrack) mult*=2;
    return mult;
  }

  //This is going to take in a sub array from unitArray and the concomitant entry in the $scope.hands array.  Ideally used in a for loop looping through either hands or unitArray
  function narrativizeHand(unitScore, rawHandObject, eventObject) {
    //Store this variable inside each subObject of hands array
    var handAsNarrative = {};
    handAsNarrative.eventId = SheepsheadService.data.eventNeedingHands;
    var indexOfDeclarer;
    var indexOfPartner;
    var holder = unitScore.slice(0);
    var multiplyer = handMultiplyer(rawHandObject);
    var winners = countPositives(unitScore);
    var losers = countNegatives(unitScore);

    if (rawHandObject.leaster) {
      indexOfDeclarer = findIndexOfGreatest(unitScore);
      handAsNarrative.declarerID = eventObject.players[indexOfDeclarer].id;
      handAsNarrative.won = true;
      if (unitScore[indexOfDeclarer] === 3 * losers) {
        handAsNarrative.schwarz = true;
      }
      return handAsNarrative;
    }
    if (rawHandObject.moster) {
      indexOfDeclarer = findIndexOfLeast(unitScore);
      handAsNarrative.declarerID = eventObject.players[indexOfDeclarer].id;
      handAsNarrative.won = false;
      return handAsNarrative;
    }

    if (winners === 1) {
      indexOfDeclarer = findIndexOfGreatest(unitScore);
      handAsNarrative.declarerID = eventObject.players[indexOfDeclarer].id;
      handAsNarrative.won = true;
      if (unitScore[indexOfDeclarer] / multiplyer === losers) {
        handAsNarrative.schneider = true;
      } else if (unitScore[indexOfDeclarer] / multiplyer === 2 * losers) {
        handAsNarrative.schneider = false;
      } else if (unitScore[indexOfDeclarer] / multiplyer === 3 * losers) {
        handAsNarrative.schwarz = true;
      }
    } else if (losers === 1) {
      indexOfDeclarer = findIndexOfLeast(unitScore);
      handAsNarrative.declarerID = eventObject.players[indexOfDeclarer].id;
      handAsNarrative.won = false;
      if(unitScore[indexOfDeclarer] / multiplyer === -2 * winners) {
        handAsNarrative.schneider = true;
      } else if (unitScore[indexOfDeclarer] / multiplyer === -4 * winners) {
        handAsNarrative.schneider = false;
      } else if (unitScore[indexOfDeclarer] / multiplyer === -6 * winners) {
        handAsNarrative.schwarz = true;
      }
    } else if (winners < losers) {
      indexOfDeclarer = findIndexOfGreatest(unitScore);
      handAsNarrative.declarerID = eventObject.players[indexOfDeclarer].id;
      handAsNarrative.won = true;
      holder[indexOfDeclarer] = 0;
      indexOfPartner = findIndexOfGreatest(holder);
      handAsNarrative.partnerID = eventObject.players[indexOfPartner].id;
      if (unitScore[indexOfDeclarer] / multiplyer === (losers - 1)) {
        handAsNarrative.schneider = true;
      } else if (unitScore[indexOfDeclarer] / multiplyer === 2 * (losers - 1)) {
        handAsNarrative.schneider = false;
      } else if (unitScore[indexOfDeclarer] / multiplyer === 3 * (losers - 1)) {
        handAsNarrative.schwarz = true;
      }
    } else if (winners > losers) {
      indexOfDeclarer = findIndexOfLeast(unitScore);
      handAsNarrative.declarerID = eventObject.players[indexOfDeclarer].id;
      handAsNarrative.won = false;
      holder[indexOfDeclarer] = 0;
      indexOfPartner = findIndexOfLeast(holder);
      handAsNarrative.partnerID = eventObject.players[indexOfPartner].id;
      if(unitScore[indexOfDeclarer] / multiplyer === -2 * (winners - 1)) {
        handAsNarrative.schneider = true;
      } else if (unitScore[indexOfDeclarer] / multiplyer === -4 * (winners - 1)) {
        handAsNarrative.schneider = false;
      } else if (unitScore[indexOfDeclarer] / multiplyer === -6 * (winners - 1)) {
        handAsNarrative.schwarz = true;
      }
    }

    return handAsNarrative;
  }

  $scope.addRound = function() {
    $scope.hands[$scope.hands.length] = {
      scores: range($scope.event.players.length)
    };
  };

  $scope.deleteRow = function(i) {
    $scope.hands.splice(i, 1);
  };

  $scope.reviewHands = function() {
    var unitArray = handsToUnits($scope.hands);
    for (var i = 0; i < $scope.hands.length; i++) {
      $scope.hands[i].narrativizedHand = narrativizeHand(unitArray[i], $scope.hands[i], $scope.event);

      var unitScoreTotal = 0;
      for (var j = 0; j < unitArray[i].length; j++) {
        unitScoreTotal += unitArray[i][j];
      }
      if (unitScoreTotal !== 0) {
        $scope.hands[i].warning = true;
      } else if ($scope.hands[i].leaster && countPositives(unitArray[i]) !== 1) {
        $scope.hands[i].warning = true;
      } else if ($scope.hands[i].moster && countNegatives(unitArray[i]) !== 1) {
        $scope.hands[i].warning = true;
      } else if (!($scope.hands[i].leaster || $scope.hands[i].moster) && $scope.hands[i].narrativizedHand.schneider === undefined && $scope.hands[i].narrativizedHand.schwarz === undefined) {
        $scope.hands[i].warning = true;
      } else {
        $scope.hands[i].warning = false;
      }
    }
    $scope.postHands();

  };

  function readyForSubmission(hands) {
    if (hands.length < 1) return false;
    for (var i = 0; i < hands.length; i++) {
      if (hands[i].warning === true) {
        return false;
      }
    }
    return true;
  }

  $scope.postHands = function() {
    if (!readyForSubmission($scope.hands)) {
      console.log("I can't go for that");
      return false;
    }
    SheepsheadService.data.handDetail = $scope.hands[0].narrativizedHand.eventId;
    console.log("All clear, post goes here.");
    $http.post('/api/hands', $scope.hands)
      .then(function(response){
        SheepsheadService.getEvents();
        SheepsheadService.getUsers();
        $location.path('/hands');
      });
  };

}]);

app.controller('UsersController', ['$scope', '$http', '$location', 'SheepsheadService',  function($scope, $http, $location, SheepsheadService){

  $scope.data = SheepsheadService.data;
  $scope.user = {};

  $scope.showUserDetail = function(id) {
    $http.get('/api/users/' + id).then(function(response){
      $scope.user = response.data[0];
    });
  };

  $scope.eventDetail = function(eventId) {
    SheepsheadService.data.eventDetail = eventId;
    $location.path('/events');
  };

  $scope.clearUser = function() {
    $scope.user = {};
  };

}]);

app.controller('CreateUserController', ['$scope', '$http', '$location', 'SheepsheadService', function($scope, $http, $location, SheepsheadService) {

  $scope.newUserName = '';
  $scope.userCreated = false;

  $scope.postUser = function() {
    $scope.userCreated = false;
    $http.post('/api/users', {"name": $scope.newUserName})
      .then(function(response){
        if (response.status === 200) {
          $scope.userCreated = true;
        } else {
          console.log("ERROR");
        }
      });
  };

}]);

app.controller('LoginController', ['$scope', '$http', '$location', 'SheepsheadService', function($scope, $http, $location, SheepsheadService){

  $scope.username = '';
  $scope.password = '';
  $scope.loginFailed = 'Login Failed';
  $scope.showFailedMessage = false;
  $scope.admin = SheepsheadService.admin;

  $scope.login = function() {
    $scope.showFailedMessage = false;
    $http.post('/login', {"username": $scope.username, "password": $scope.password}).then(function(response){
      if(response.data.username) {
        $scope.admin = response.data;
        SheepsheadService.admin = response.data;
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

app.factory('SheepsheadService', ['$http', function($http) {

  var data = {
    eventNeedingHands: 0,
    admin: {},
  };

  var getLeagues = function() {
    $http.get('/api/leagues').then(function(response){
      data.leagues = response.data;
    });
  };

  var getEvents = function() {
    $http.get('/api/events').then(function(response){
      data.events = response.data;
      data.startDate = data.events[0].date.slice(0,10);
      data.endDate = data.events[data.events.length - 1].date.slice(0,10);
    });
  };

  var getUsers = function() {
    $http.get('/api/users').then(function(response){
      data.users = response.data;
    });
  };

  var getUsersNoScores = function() {
    $http.get('/api/users/noScores').then(function(response){
      data.usersNoScores = response.data;
    });
  };

  return {
    data: data,
    getLeagues: getLeagues,
    getEvents: getEvents,
    getUsers: getUsers,
    getUsersNoScores: getUsersNoScores
  };

}]);
