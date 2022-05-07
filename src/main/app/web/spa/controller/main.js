'use strict';

angular.module('Main', []);
angular.module('Authentication', []);
angular.module('Management', []);
angular.module('Archiver', []);
angular.module('Navigation', []);

var myApp = angular.module('myApp',[
	'Main',
	'Authentication',
	'Management',
	'Archiver',
    'Navigation',
    'ngRoute',
    'ngCookies',
    'ngMaterial', 'ngMessages', 'material.svgAssetsCache'
])
.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
		.when('/login', {
            templateUrl: 'spa/view/auth.htm',
            controller: 'auth_controller'
        })
		.when('/home', {
            templateUrl: 'spa/view/home.htm',
            controller: 'home_controller'
        })
        .when('/archiver', {
            templateUrl: 'spa/view/archiver.htm',
            controller: 'archiver_controller'
        })
        .when('/management', {
            templateUrl: 'spa/view/management.htm',
            controller: 'management_controller'
        })
        .otherwise({ redirectTo: '/home' });
}])


.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
}]);

// angular.element(document).ready(function() {
// 	angular.bootstrap(document, ['Main']);
// });