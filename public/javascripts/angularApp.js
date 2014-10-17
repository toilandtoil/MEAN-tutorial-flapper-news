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
                controller: 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
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

        o.upvote = function (post) {
            return $http.put('/posts/' + post._id + '/upvote')
                .success(function (data) {
                    post.upvotes += 1;
                });
        };

        o.get = function (id) {
            return $http.get('/posts/' + id).then(function (res) {
                return res.data;
            });
        };

        o.addComment = function (id, comment) {
            return $http.post('/posts/' + id + '/comments', comment);
        };

        o.upvoteComment = function(post, comment) {
            $log.log('comment object = ');
            $log.log(JSON.stringify(comment));
            return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
                .success(function(data){
                    $log.log('inside success handler for upvoteComment');
                    //comment.upvotes += 1;
                });
        };

        $log.log('posts = ');
        $log.log(o.posts);
        $log.log('now, return posts');
        return o;
    }])


    .controller('PostsCtrl', ['$log', '$scope', 'posts', 'post', function ($log, $scope, posts, post) {
        $scope.post = post;
        $scope.addComment = function () {
            $log.log('$scope.body :');
            $log.log($scope.body);
            if ($scope.body === '' || $scope.body === undefined ) {
                return;
            }
            posts.addComment(post._id, {
                body: $scope.body,
                author: 'user'
            }).success(function (comment) {
                $scope.post.comments.push(comment);
            });
            $scope.body = '';
        };

        $scope.incrementUpvotes = function(comment){
            posts.upvoteComment(post, comment);
        };

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
            posts.upvote(post);
        };
    }])