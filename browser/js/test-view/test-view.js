'use strict';
app.config(function($stateProvider) {
  $stateProvider.state('testView', {
    abstract: true,
    url: '/test/:testId',
    templateUrl: 'js/test-view/test-view.html',
    controller: 'TestViewCtrl',
    resolve: {
      test: function(Test, $stateParams) {
        return Test.get({id: $stateParams.testId}).$promise;
      },
      groups: function(Populate, test) {
        return Populate.query({model: 'Test', id: test._id, field: 'group'}).$promise;
      },
      user: function(AuthService) {
        return AuthService.getLoggedInUser();
      },
      isInstructor: function(user, test) {
        return user._id === test.owner;
      },
      isEdit: function($rootScope) {
        return $rootScope.toState.url === '/edit';
      },
      isReview: function() {
        return false;
      },
      result: function(isEdit, UserFactory, user, test) {
        if (isEdit) return;
        else return UserFactory.getTestResult(user, test);
      }
    },
    data: {
      authenticate: true
    }
  });

  $stateProvider.state('testView.fileView', {
    url: '/file/:filePath',
    templateUrl: 'js/test-view/directives/file-view/file-view.html',
    controller: 'FileViewCtrl'
  });

  $stateProvider.state('testView.fileView.edit', {
    url:'/edit',
  });

  $stateProvider.state('testView.fileView.take', {
    url:'/take'
  });
});

app.controller('TestViewCtrl', function($scope, test, TestFactory, $state, user, Test, $alert, isEdit, isReview, result, groups) {
  $scope.user = user;
  $scope.isEdit = isEdit;
  $scope.test = test;
  $scope.test.groups = groups;
  $scope.result = result;
  $scope.treedata = TestFactory.getTableObj(test, result);
  $scope.readOnlyChange = false;
  $scope.isPending = (test.status === "Pending");

  $scope.opts = {
    dirSelectable: false
  };

  $scope.showFile = function(node) {
    if ($scope.isEdit) $state.go('testView.fileView.edit', {filePath: node.fullPath});
    else if (isReview) $state.go('resultView.fileView.take', {filePath: node.fullPath});
    else $state.go('testView.fileView.take', {filePath: node.fullPath});
  };

  $scope.clickCheckbox = function(node) {
    $scope.readOnlyChange = true;
    TestFactory.updateReadOnlyStatus($scope.treedata, node);
  };

  $scope.saveReadOnlyChanges = function() {
    var testObj = TestFactory.getUpdatedTestObj($scope.treedata);
    Test.update({id: test._id}, testObj).$promise.then(function() {
      $scope.readOnlyChange = false;
      $alert({
        title: 'Read-only states saved',
        type: 'success'
      });
    });
  };
});