'use strict';
app.config(function($stateProvider) {
  $stateProvider.state('dashboard', {
    url: '/dashboard',
    templateUrl: 'js/dashboard/dashboard.html',
    controller: 'DashboardCtrl',
    resolve: {
      user: function(AuthService) {
        return AuthService.getLoggedInUser();
      },
      myTests: function(UserTest, user) {
        return UserTest.query({userId: user._id}).$promise;
      },
      possibleTests: function(Test, user) {
        return Test.query({username: user.username}).$promise.then(function(tests) {
          return tests.filter(function(test) {
            return test.status !== 'Pending';
          });
        });
      },
      results: function(Populate, user) {
        return Populate.query({model: 'user', id: user._id, field: 'takenTests'}).$promise;
      }
    },
    data: {
      authenticate: true
    }
  });
});

app.controller('DashboardCtrl', function($scope, $state, Test, myTests, possibleTests, TestFactory, $alert, UserTest, user, results, objIndexOf, Socket) {
  $scope.myTests = myTests;
  $scope.possibleTests = possibleTests;
  $scope.results = results;

  function reloadState(data) {
    $state.reload();
  } 

  // Socket.on('test:published', reloadState);
  // Socket.on('test:deleted', reloadState);
  // Socket.on('test:updated', reloadState);

  $scope.possibleTests.forEach(function(test) {
    var ind = objIndexOf(results, test._id, 'test');
    test.status = (ind === -1) ? 'Not Started' : results[ind].status;
    test.score = (ind === -1) ? 0 : results[ind].score;
    test.submittedAt = (ind !== -1 && results[ind].submittedAt)
      ? results[ind].submittedAt : 'Not Submitted Yet';
  });

  $scope.results.forEach(function(result) {
    if (!result.submittedAt) result.submittedAt = 'Not Submitted';
  });

  $scope.deleteTest = function(testId) {
    TestFactory.deleteTest(testId).then(function() {
      var myTestInd = objIndexOf($scope.myTests, testId, '_id');
      $scope.myTests.splice(myTestInd, 1);

      var posTestInd = objIndexOf($scope.possibleTests, testId, '_id');
      if (posTestInd !== -1) $scope.possibleTests.splice(posTestInd, 1);
   
      $alert({
        title: 'Test deleted',
        type: 'danger'
      });
    });
  };
});