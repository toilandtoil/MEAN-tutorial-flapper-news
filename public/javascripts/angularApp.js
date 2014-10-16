angular.module('flapperNews', ['ui.router'])


    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function (posts) {
                        return posts.getAll();
                    }]
                }

            })
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl'
            })


        $urlRouterProvider.otherwise('/home');
    }])

    .factory('posts', ['$http', '$log', function ($http, $log) {
        var o = {
            posts: []
        };

        /* In this function we're using the Angular $http service to query our posts route.
         The success() function allows us to bind function that will be executed when the request returns.
         Because our route will return a list of posts, all we need to do is copy that list to the client
         side posts object. Notice that we're using the angular.copy() function to do this
         as it will make our UI update properly. */
        o.getAll = function () {
            return $http.get('/posts').success(function (data) {
                $log.log('Inside posts.getAll and data = ');
                $log.log(JSON.stringify(data, null, 4));
                angular.copy(data, o.posts);
            });
        };

        o.create = function (post) {
            return $http.post('/posts', post).success(function (data) {
                o.posts.push(data);
            });
        };

        $log.log('posts = ');
        $log.log(o.posts);
        $log.log('now, return posts');
        return o;
    }])


    .controller('PostsCtrl', ['$scope', '$stateParams', 'posts', function ($scope, $stateParams, posts) {
        $scope.post = posts.posts[$stateParams.id];
        $scope.addComment = function () {
            if ($scope.body === '') {
                return;
            }
            $scope.post.comments.push({
                body: $scope.body,
                author: 'user',
                upvotes: 0
            });
            $scope.body = '';
        }
    }])

    .controller('MainCtrl', ['$scope', '$log', 'posts', function ($scope, $log, posts) {
        $log.log('inside MainCtrl');
        $scope.posts = posts.posts;
        $log.log('$scope.posts = ');
        $log.log(JSON.stringify($scope.posts, null, 4));


        $scope.addPost = function () {
            if ($scope.title === '') {
                return;
            }
            posts.create({
                title: $scope.title,
                link: $scope.link
            });
            $scope.title = '';
            $scope.link = '';
        };

        $scope.incrementUpvotes = function (post) {
            post.upvotes += 1;
        }
    }])