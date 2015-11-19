/*
    Vieving of property controllers.
*/

var app = angular.module('ssApp');

app.controller('ViewViewingCtrl', ['$scope', '$http', '$attrs', '$modal', '$window',
    function ($scope, $http, $attrs, $modal, $window) {
        var viewingId = $attrs.viewingId;

        $scope.viewingStatus = $attrs.viewingStatus;
        $scope.showControls = true;

        $scope.startPayment = function () {
            $window.location.replace(ss.routes.viewingpayment.replace('<viewing_id>', viewingId));
        };

        $scope.acceptViewing = function () {
            $http.post(ss.routes.acceptviewing.replace('<viewing_id>', viewingId))
                .success(function (data, status, headers, config) {
                    $scope.acceptError = '';
                    $scope.viewingStatus = 'accepted';
                    $scope.showControls = false;
                })
                .error(function (data, status, headers, config) {
                    if (data && data.error) {
                        $scope.acceptError = data.error;
                    } else {
                        $scope.acceptError = 'Error has occurred. Please try again.';
                    }
                });
        };

        $scope.openRejectionModal = function () {
            var modal = $modal.open({
                animation: true,
                templateUrl: 'rejectViewingModal.html',
                controller: 'RejectViewingCtrl',
                size: 'md',
                resolve: {
                    viewingId: function() {
                        return viewingId;
                    }
                }
            });
            modal.result.then(function (reason) {
                $scope.showControls = false;
                $scope.viewingStatus = 'rejected';
                $scope.rejectionReason = reason;
            });
        };
    }
]);

app.controller('RejectViewingCtrl', ['$scope', '$http', '$modalInstance', 'viewingId',
    function($scope, $http, $modalInstance, viewingId) {
        $scope.reason = '';

        $scope.reject = function () {
            var data = {
                'rejection_reason': $scope.reason,
            };
            $http.post(ss.routes.rejectviewing.replace('<viewing_id>', viewingId), data)
                .success(function (data, status, headers, config) {
                    $scope.rejectError = '';
                    $modalInstance.close($scope.reason);
                })
                .error(function (data, status, headers, config) {
                    if (data && data.error) {
                        $scope.rejectError = data.error;
                    } else {
                        $scope.acceptError = 'Error has occurred. Please try again.';
                    }
                });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
]);