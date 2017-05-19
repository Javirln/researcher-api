angular.module("ResearcherListApp").controller("ListCtrl", function($scope, $http, $location) {

    var socket = io();

    $scope.universities = [];
    $scope.groups = [];
    $scope.projects = [];
    $scope.researcher = {
        projects: []
    };

    socket.on('connect', function() {
        console.log("Connected to socket: " + socket.id);
    });

    function updateResearchList() {
        $http.get("/api/v1/researchers", {
            headers: {
                'Authorization': 'Bearer ' + $scope.token
            }
        }).then(function(response) {
            $scope.researchers = response.data;
        });
    }

    function refresh() {
        if ($location.search().access_token == undefined) {
            console.log("Using default token");
            $('#login-provider').show();
            $('#logout-provider').hide();
            $scope.titleLogin = "Log in"
            $scope.messageLogin = "Right now you are using the default token. Click on some of this providers to log in with them.";
            $scope.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTI3NjYyMjQsImV4cCI6MTQ5Mzk3NTgyNH0.WExNusVFHUcM6LKCwp3cz2SudqM1-CWF3DCZZIPNF-E ";
        }
        else {
            console.log("Using non-default token");
            $scope.titleLogin = "Logged!"
            $scope.messageLogin = "Right now you are using a token provided by Google or Facebook.";
            $('#login-provider').hide();
            $('#logout-provider').show();
            $scope.token = $location.search().access_token;
        }
        console.log("Refreshing");
        $scope.actionTitle = "Add researcher";
        $scope.action = "Add";
        $scope.buttonClass = "btn btn-primary";
        $scope.researcher.projects = [];
        $scope.projects = [];
        $scope.groups = [];
        $scope.searchResult = null;
        $scope.searchError = null;
        $scope.updateCreateResult = null;
        $scope.updateCreateError = null;

        $http.get("/api/v1/researchers", {
            headers: {
                'Authorization': 'Bearer ' + $scope.token
            }
        }).then(function(response) {
            $scope.researchers = response.data;
            $scope.disabledSearch = true;
            $scope.addResearcherForm.$setPristine();
            $scope.newResearcher = {};
            $scope.orcidFilter = null;
        });


        $scope.loadUniversities();

    }

    $scope.loadUniversities = function() {
        console.log("Loading universities");
        $scope.universities = [];
        /*
        //GET A 01 universities
        $http.get("https://aws1617-04.herokuapp.com/api/v1/universities", {
            
        }).then(function(response) {
            //Fill universities array
        });*/
        $scope.universities.push({
            name: "Universidad de Sevilla",
            acronym: "US",
            icon: "http://ftp.us.es/ftp/pub/Logos/marca-tinta-roja_300.gif"
        });
        $scope.universities.push({
            name: "Universidad de Cadiz",
            acronym: "UCA",
            icon: "http://actividades.uca.es/logotipos/LogoUCA/image_preview"
        });
    };

    $scope.loadResearchGroups = function() {
        var university = $scope.newResearcher.university.acronym;
        console.log("Loading groups for university " + university);
        $scope.groups = [];

        //GET A 03 group by university
        /*$http.get("https://aws1617-01.herokuapp.com/api/v1/projectsbyuniversity/" + university, {}).then(function(response) {
            $scope.projects = response.data;
            for (var i = 0; i < $scope.projects.length; i++) {
                $scope.projects[i].id = parseInt($scope.projects[i].id);
            }
        });*/
        if (university == "US") {
            $scope.groups.push({
                id: 1,
                name: "Ingeniería del Software Aplicada",
                icon: "Grupo de investigación de la US",
                university: "US"
            });
        }
        else if (university == "UCA") {
            $scope.groups.push({
                id: 2,
                name: "Ingeniería Informatica",
                icon: "Grupo de investigación de la UCA",
                university: "UCA"
            });
        }
    };

    $scope.loadResearchProjects = function() {
        var group = $scope.newResearcher.group.id;
        console.log("Loading projects for group " + group);
        $scope.projects = [];

        //CAMBIAR A projectsByGroup
        $http.get("https://aws1617-01.herokuapp.com/api/v1/projectsbyuniversity/" + group, {}).then(function(response) {
            $scope.projects = response.data;
            for (var i = 0; i < $scope.projects.length; i++) {
                $scope.projects[i].id = parseInt($scope.projects[i].id);
            }
        });
    };

    $scope.submitForm = function() {
        $scope.newResearcher.university = $scope.newResearcher.university.acronym;
        $scope.newResearcher.group = $scope.newResearcher.group.id;
        $scope.newResearcher.projects = $scope.researcher.projects;
        if ($scope.actionTitle == "Add researcher") {
            console.log("Adding researcher " + $scope.newResearcher.name);
            $http.post("/api/v1/researchers", $scope.newResearcher, {
                headers: {
                    'Authorization': 'Bearer ' + $scope.token
                }
            }).then(function() {
                socket.emit('nr', 'ok');
                refresh();
            }, function(response) {
                refresh();
                $scope.updateCreateResult = "alert alert-danger";
                $scope.updateCreateError = response.data.msg;
            });
        }
        else if ($scope.actionTitle == "Update researcher") {
            console.log("Updating researcher " + $scope.researcherToUpdate.name);
            $http.put("/api/v1/researchers/" + $scope.researcherToUpdate.orcid, $scope.newResearcher, {
                headers: {
                    'Authorization': 'Bearer ' + $scope.token
                }
            }).then(function() {
                socket.emit('nr', 'ok');
                refresh();
            }, function(response) {
                refresh();
                $scope.updateCreateResult = "alert alert-danger";
                $scope.updateCreateError = response.data.msg;
            });
        }
    };

    $scope.addResearcher = function() {
        console.log("Adding researcher " + $scope.newResearcher.name);
        $http.post("/api/v1/researchers", $scope.newResearcher, {
            headers: {
                'Authorization': 'Bearer ' + $scope.token
            }
        }).then(function() {
            socket.emit('nr', 'ok');
            refresh();
        });

    };

    $scope.deleteResearcher = function(idx) {
        if (confirm("Are you sure!?")) {
            console.log("Deleting researcher " + $scope.researchers[idx].name);
            $http.delete("/api/v1/researchers/" + $scope.researchers[idx].orcid, {
                headers: {
                    'Authorization': 'Bearer ' + $scope.token
                }
            }).then(function() {
                socket.emit('nr', 'ok');
                refresh();
            }, function(response) {
                refresh();
                $scope.updateCreateResult = "alert alert-danger";
                $scope.updateCreateError = response.data.msg;
            });
        }
    };

    $scope.preUpdateResearcher = function(idx) {
        console.log("Pre-updating researcher " + $scope.researchers[idx].name);
        $scope.actionTitle = "Update researcher";
        $scope.action = "Update";
        $scope.buttonClass = "btn btn-warning";
        $scope.updateCreateResult = null;
        $scope.updateCreateError = null;
        $scope.researcherToUpdate = $scope.researchers[idx];
        $scope.newResearcher.orcid = $scope.researcherToUpdate.orcid;
        $scope.newResearcher.name = $scope.researcherToUpdate.name;
        $scope.newResearcher.phone = parseInt($scope.researcherToUpdate.phone);
        $scope.newResearcher.email = $scope.researcherToUpdate.email;
        $scope.newResearcher.address = $scope.researcherToUpdate.address;

        var index = $scope.universities.findIndex(function(item, i) {
            return item.acronym === $scope.researcherToUpdate.university;
        });
        $scope.newResearcher.university = $scope.universities[index];
        $scope.loadResearchGroups();

        index = $scope.groups.findIndex(function(item, i) {
            return item.id === $scope.researcherToUpdate.group;
        });
        $scope.newResearcher.group = $scope.groups[index];
        $scope.loadResearchProjects();

        $scope.researcher.projects = $scope.researcherToUpdate.projects;
        $scope.newResearcher.gender = $scope.researcherToUpdate.gender;
    };

    $scope.searchResearcher = function() {
        console.log("Get researcher " + $scope.orcidFilter);
        $http.get("/api/v1/researchers/" + $scope.orcidFilter, {
            headers: {
                'Authorization': 'Bearer ' + $scope.token
            }
        }).then(function(response) {
            $scope.researchers = response.data;
            $scope.addResearcherForm.$setPristine();
            $scope.newResearcher = {};
        }, function(response) {
            $scope.searchResult = "alert alert-danger";
            $scope.searchError = response.data.msg;
            console.log("Unauthorized!");
        });
    };

    $scope.deleteAll = function() {
        if (confirm("Are you sure!?")) {
            console.log("Deleting all");
            $http.delete("/api/v1/researchers/", {
                headers: {
                    'Authorization': 'Bearer ' + $scope.token
                }
            }).then(function() {
                refresh();
            });
        }

    };

    $scope.refresh = function() {
        refresh();
    };

    socket.on('newResearcher', function(data) {
        updateResearchList();
    });

    refresh();
});
