define([
    'angular'
], function (ng) {
    'use strict';
    return ng.module('common.helpers', [])
        .factory('chunkList', [chunkList])
        .factory('customGeocoder', ['$q', customGeocoder])
        .factory('initMap', [initMap]);

    function chunkList() {
        /*
            Helps to chunk list to n chunks. Takes two parameters:
            list - JS array object to chunk, chunkSize - integer size of one chunk.
            Return array of chunks.
        */
        return function(list, chunkSize) {
            var result = [];
            while (list.length > 0) {
                result.push(list.splice(0, chunkSize));
            }

            return result;
        };
    }

    function customGeocoder($q) {
        /*
            Helps to get location coordinated from address string. Takes one parameter:
            address - address string of location.
            Return coordinates promise.
        */

        function getLatLng(address, d) {
            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({ address : address }, function (result, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var latLng = {
                        lat: result[0].geometry.location.lat(),
                        lng: result[0].geometry.location.lng()
                    };
                    d.resolve(latLng);
                } else {
                    d.reject('Coordinates was not found.');
                }
            });
        }

        return function(address) {
            var d = $q.defer();
            getLatLng(address, d);
            return d.promise;
        };
    }

    function initMap() {
        /*
            Initializes Google Map with marker. Takes one parameter:
            latLng - coordinates of map center and marker position.
            Return map object.
        */
        return function(latLng) {
            var map = new google.maps.Map(document.getElementById('map-canvas'), {
                zoom: 16,
                center: latLng
            });
            var marker = new google.maps.Marker({
                position: latLng,
                map: map,
            });
            return map;
        };
    }
});