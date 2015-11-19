/*
    Visual adbits management code.
*/
angular.module('adbitsApp')
    .controller('VisualSegmentCtrl', [
        '$scope', '$window', 'strings', 'userPermissions', 'adBitDialogService', 'VisualSegmentResource', 'successMessage', 'errorMessage',
        function ($scope, $window, strings, userPermissions, adBitDialogService, VisualSegmentResource, successMessage, errorMessage) {
            $scope.userPermissions = userPermissions;

            $scope.init = function(adId) {
                $scope.adId = adId;
                $scope.visualSegments = VisualSegmentResource.query({adId: adId});
            };

            $scope.appendBlankSegment = function(){
                $scope.visualSegments.push(new VisualSegmentResource({'_inEditing': true}));
            };

            $scope.setSegmentName = function (segment){
                var resourceMethod = segment.hasOwnProperty('id') ? '$update' : '$save';
                segment[resourceMethod](
                    {'adId': $scope.adId},
                    function(){
                        segment._inEditing = false;
                        segment.infoMsg = '';
                    },
                    function(response){
                        if (response.data && response.status < 500){
                            segment.infoMsg = response.data.name.join("\n");
                        }else{
                            $scope.infoMsg = errorMessage;
                        }
                    });
            };

            $scope.deleteSegment = function(segment, index) {
                if ($window.confirm(strings.areYouSureDeleteItem)) {
                    segment.$delete(
                        {'adId': $scope.adId},
                        function (){
                            $scope.visualSegments.splice(index, 1);
                        },
                         function(response) {
                             if (response.data && response.data.errors) {
                                 $scope.infoMsg = response.data.errors;
                             } else {
                                 $scope.infoMsg = errorMessage;
                             }
                         }
                    );
                }
            };

            $scope.openDialog = function(segment, isEditMode){
                var dialog = adBitDialogService.openDialog({'adId': $scope.adId, 'id': segment.id},
                                                           true, isEditMode);
                dialog.closePromise.then(function (data) {
                    if (data.value) {
                        var segment = data.value;
                        var index = _.findIndex($scope.visualSegments, {'id': segment.id});
                        $scope.visualSegments[index] = segment;
                        $scope.infoMsg = successMessage;
                    }
                });
            };
    }]);
