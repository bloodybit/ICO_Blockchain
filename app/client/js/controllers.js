angular.module("Blockstarter.controllers", [])

.controller('AppCtrl', function($scope, Api, $rootScope, $http, CONFIG, $window, AuthService) {

    console.log("AppCtrl");
    console.log(AuthService.isAuthenticated());

    let logout = () => {
        AuthService.logout();
        $window.location.href = "/#/login";
    }

    if (!AuthService.isAuthenticated()) {
        logout();
    }

    $scope.logout = logout;

    if (AuthService.getUser()) {
        $scope.address = AuthService.getUser().address;
    }
})

.controller('ProjectsCtrl', function($scope, Api, $window, $rootScope, AuthService, projectService) {
    console.log("ProjectsCtrl");
    const user = AuthService.getUser();
    console.log(user);
    $scope.projectList = [];
    Api
        .getAllProjects()
        .then(response => {
            console.log(response);
            $scope.projectList = response;
        })
        .catch(error => console.log(error));

    $scope.openProject = (project) => {
        console.log(`called index: ${project}`)
        projectService.addProject(project);
        $window.location.href = `/#/projects/view/${project.address}`;
    }

    $scope.createProject = (project, token) => {
        project.creator = token.creator = user.address;
        let request = { project, token };
        console.log(request);

        Api
            .addProject(request)
            .then(response => {
                console.log(response);
                $window.location.href = '/#/projects'
            })
            .catch(error => console.log(error));
    }

})

.controller('ProjectCtrl', function($scope, Api, $window, $rootScope, $routeParams, AuthService, projectService) {
    console.log("Single Project Ctrl");
    const user = AuthService.getUser();
    $scope.user = user;
    console.log(user);
    $scope.project = projectService.getProject();

    if (!$scope.project) {
        Api
            .getProject($routeParams.project)
            .then(response => {
                console.log(response);
                $scope.project = response;
            })
            .catch(error => console.log(error));
    }

    $scope.fundProject = (project, amount) => {
        const req = {
            project,
            amount,
            backer: user.address
        }
        console.log(req);
        Api
            .backProject(req)
            .then(response => {
                console.log(response);
                $scope.project.fundingStatus = parseFloat($scope.project.fundingStatus) + parseFloat(amount);
                $scope.project.finalFundings = parseFloat($scope.project.finalFundings) + parseFloat(amount);
                $scope.project.goalReached = $scope.project.finalFundings >= $scope.project.fundingGoal;
            })
            .catch(error => console.error(error));
    }

    $scope.withdrawProject = (project, amount) => {
        const req = {
            project,
            amount,
            creator: user.address
        };
        console.log(req);

        Api
            .withdrawProject(req)
            .then(response => {
                console.log('Withdraw', response);
                $scope.project.fundingStatus = parseFloat($scope.project.fundingStatus) - parseFloat(amount);

            })
            .catch(error => console.error(error));
    }

    $scope.claimShares = (project, token) => {
        const req = {
            token,
            project,
            backer: user.address
        }

        Api
            .claimShares(req)
            .then(response => console.log('Claim Shares', response))
            .catch(error => console.error(errors));
    }

})

.controller('CreatorsCtrl', function($scope, Api, $window, $rootScope, AuthService, projectService) {
    console.log("CreatorsCtrl");
    $scope.projectList = [];
    Api
        .getCreatedProjects(AuthService.getUser().address)
        .then(response => {
            console.log(response);
            $scope.projectList = response;
        })
        .catch(error => console.log(error));

    $scope.openProject = (project) => {
        console.log(`called index: ${project}`)
        projectService.addProject(project);
        $window.location.href = `/#/projects/view/${project.address}`;
    }
})

.controller('BackersCtrl', function($scope, Api, $window, $rootScope, AuthService, projectService) {
    console.log("BackersCtrl");
    $scope.projectList = [];
    Api
        .getBackedProjects(AuthService.getUser().address)
        .then(response => {
            console.log(response);
            $scope.projectList = response;
        })
        .catch(error => console.error(error));

    $scope.openProject = (project) => {
        console.log(`called index: ${project}`)
        projectService.addProject(project);
        $window.location.href = `/#/projects/view/${project.address}`;
    }
})

.controller('LoginCtrl', function($scope, Api, $window, $rootScope, AuthService, $http, CONFIG, AUTH_EVENTS) {
    console.log("LoginCtrl");

    // check if the user is already authenticated, if so, redirect home
    if (AuthService.isAuthenticated()) {
        console.info("Auth");
        $window.location.href = "/#/projects/view";
    }

    // login
    $scope.login = user => {
        if (typeof user.address !== 'number' || user.address < 0 || user.address > 9) {
            $scope.error = "Invalid Address";
        } else {
            AuthService
                .login(user)
                .then(msg => { $window.location.reload(); })
                .catch(errMsg => { $scope.error = errMsg; });
        }

    };

    // blocks the user on the page until it isn't logged
    $scope.$on('$locationChangeStart', (event) => {
        if (!AuthService.isAuthenticated()) {
            event.preventDefault();
            $window.location.href = "/#/login";
        }
    });
})

.controller('UserCtrl', function($scope, Api, $rootScope, $http, CONFIG, $window, AuthService, AUTH_EVENTS) {

    console.log("UserCtrl");
});