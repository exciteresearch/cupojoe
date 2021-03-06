'use strict';
app.config(function ($stateProvider) {
  $stateProvider.state('newTest', {
    url: '/test/new/',
    templateUrl: 'js/new-test/new-test.html',
    controller: 'NewTestCtrl',
    resolve: {
      user: function(AuthService) {
        return AuthService.getLoggedInUser();
      },
      repos: function(user, GithubFactory) {
        return GithubFactory.getUserRepos(user);
      },
      groups: function(UserGroup, user) {
        return UserGroup.query({userId: user._id}).$promise;
      }
    }
  });

});

app.controller('NewTestCtrl', function ($scope, $q, $state, user, repos, groups, UserGroup, Test) {
  
  $scope.repos = repos;
  $scope.user = user;
  //$scope.groups = groups;


  var test;
  test = $scope.test = {};
  test.owner = user._id;
  test.status = 'Pending';

  function saveTest() {

    var testCopy = angular.copy(test);
    testCopy.groups = testCopy.groups.map(function(group) {
      return group._id;
    });
    $scope.load.promise = Test.save(testCopy).$promise;
    $scope.load.message = 'Test being populated...';
    $scope.load.promise.then(function(newTest) {
      $state.go('testView.fileView.edit', {testId: newTest._id});
    });
  }

  function loadGroups(q) {
    return UserGroup.query({userId: user._id}).$promise;
  }

  

  $scope.saveTest = saveTest;
  $scope.loadGroups = loadGroups;
 
});

