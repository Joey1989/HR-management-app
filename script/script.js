var myApp = angular.module('myApp', ['infinite-scroll','ngRoute','ui.bootstrap']);


      myApp.directive('camera', function (productCtrl) {
            return {
              template: '\
              <div ng-show="showVideo">\
                  <div class="select">\
                      <label for="videoSource">Video source: </label><select id="videoSource"></select>\
                  </div>\
                  <div style="text-align:center;"><video id="video" width="480" height="480" autoplay></video></div>\
                  <div style="text-align:center;"><button class="btn btn-info" ng-click="snap()">Snap Photo</button>\
                  <a class="btn btn-large btn-info" href="#/createemployee">Go back</a></div>\
              </div>\
              <div ng-show="showSnap">\
                  <div style="text-align:center;"><canvas id="canvas" width="480" height="480"></canvas></div>\
                  <div style="text-align:center;"><button class="btn btn-info" ng-click="save()">Save Photo</button>\
                  <button class="btn btn-info" ng-click="cancel()">Cancel</button></div>\
              </div>',
              link: function ($scope) {

              $scope.showVideo = true;
              $scope.showSnap = false;

              var videoElement = document.querySelector('video');
              var videoSelect = document.querySelector('select#videoSource');

              navigator.getUserMedia = navigator.getUserMedia ||
                  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

              function gotSources(sourceInfos) {
                  for (var i = 0; i !== sourceInfos.length; ++i) {
                      var sourceInfo = sourceInfos[i];
                      var option = document.createElement('option');
                      option.value = sourceInfo.id;
                      if (sourceInfo.kind === 'video') {
                          option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
                          videoSelect.appendChild(option);
                      } else {
                          console.log('Some other kind of source: ', sourceInfo);
                      }
                  }
              }

              if (typeof MediaStreamTrack === 'undefined') {
                  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
              } else {
                  MediaStreamTrack.getSources(gotSources);
              }

              function successCallback(stream) {
                  window.stream = stream; // make stream available to console
                  videoElement.src = window.URL.createObjectURL(stream);
                  videoElement.play();
              }

              function errorCallback(error){
                  console.log('navigator.getUserMedia error: ', error);
              }

              function start(){
                  if (!!window.stream) {
                      videoElement.src = null;
                      window.stream.stop();
                  }
                  var videoSource = videoSelect.value;
                  var constraints = {
                      audio: false,
                      video: {
                          optional: [{sourceId: videoSource}]
                      }
                  };
                  navigator.getUserMedia(constraints, successCallback, errorCallback);
              }

              videoSelect.onchange = start;

              start();

             // Trigger photo take
              $scope.snap = function() {
                console.log("coucou");
                var canvas = document.getElementById("canvas");
                context = canvas.getContext("2d");
                context.drawImage(video, 0, 0, 640, 480);
                $scope.showVideo = false;
                $scope.showSnap = true;
              }


              // Save photo
              $scope.save = function() {
                    var image = new Image();
                    image.src = canvas.toDataURL("image/jpg");
                    $scope.image = image.src;
                    productCtrl.pushphoto($scope.image);
                    // console.log(productCtrl.pullphoto()+"succeed");
                    console.log($scope.image);
                    $scope.showVideo = true;
                    $scope.showSnap = false;
              }
              $scope.cancel = function() {
                $scope.showVideo = true;
                $scope.showSnap = false;
              }

              $scope.$on('$locationChangeStart', function(event) {
                  if (!!window.stream) {
                      videoElement.src = null;
                      window.stream.stop();
                  }
              });

              // Put event listeners into place
              window.addEventListener("DOMContentLoaded", function() {
                  // Grab elements, create settings, etc.
                  var canvas = document.getElementById("canvas"),
                  context = canvas.getContext("2d"),
                  video = document.getElementById("video"),
                  videoObj = { "video": true },
                  errBack = function(error) {
                      console.log("Video capture error: ", error.code); 
                  };
          }, false);
          }
      };
      });


      myApp.service('productCtrl',function($http){
             
            var persons=[];
            var seletedperson={};
            var manager={};
            var reports=[];
            var foredit={};
            var photourl="";
            this.getData = function(arr){
               persons=arr;
            }

            this.listData=function(){
              return persons;
            }


            // this.pushselected=function(person){
            //    seletedperson=person;
            // }
            // this.pullselected=function(){
            //   return  seletedperson;
            // }


            this.getnewid=function(){
              return 1+Number(persons[persons.length-1].id);  
            }

            this.addEmployee=function(person){
              persons.push(person);
            }
            
            function getEmployee(num){
              for(var i=0;i<persons.length;i++){
                if(persons[i].id==Number(num))
                  return persons[i];
              }
              return;
            }

            this.reporttomanager=function(person){
              getEmployee(Number(person.manager)).DirectReports.push(person.id);
            }

            this.quitamanager=function(person,managerid){
              console.log(managerid);
              for(var i=0;i<getEmployee(Number(managerid)).DirectReports.length;i++){
                if(person.id==getEmployee(Number(managerid)).DirectReports[i])
                  getEmployee(Number(managerid)).DirectReports.splice(i,1);
            }
            }


            // this.pushmanager=function(managerid){
            //    manager=getEmployee(managerid);
            // }
            // this.pullmanager=function(){
            //    return manager;
            // }


            this.pushreport=function(report){
               reports=[];
               for(var i=0;i<report.length;i++){
                 reports.push(getEmployee(Number(report[i])));
               }
            }
            this.pullreport=function(report){
              return reports;
            }


            this.idtomanager=function(person){ 
              // console.log(t.name);
              if(Number(person.manager)>0)
              return getEmployee(Number(person.manager)).Name;
              else
              return "N/A";
            }

            this.idtoreports=function(person){
              var reportsnames="";
              console.log(person.DirectReports.length);

              if(person.DirectReports.length==0) return "N/A";
              
              for(var i=0;i<person.DirectReports.length;i++){
                console.log( persons.length );
                console.log( Number(person.DirectReports[i]) );
                console.log( getEmployee(1) );

                 reportsnames+=getEmployee(Number(person.DirectReports[i])).Name;
                 if(i!=person.DirectReports.length-1)
                    reportsnames+=", ";
              }
              return reportsnames;
            }

            // this.pushedit=function(person){
            //    foredit=person;
            // }
            // this.pulledit=function(){
            //    return foredit;
            // }

            this.editeployeebyid=function(person){
               // console.log(person);
              for(var i=0;i<persons.length;i++){
                if(persons[i].id==person.id){
                  persons[i]=person;
                }  
              }
            }

            this.pushphoto=function(url){
              photourl=url;
            }
            this.pullphoto=function(){
              return photourl;
            }

            this.delete=function(person){
               persons.splice(person.id-1,1);
            };
            this.telldeltoboss=function(person){
              for(var i=0;i<getEmployee(Number(person.manager)).DirectReports.length;i++){
               if(getEmployee(Number(person.manager)).DirectReports[i]==person.id)
                getEmployee(Number(person.manager)).DirectReports.splice(i,1);
              }
            };
            this.telldeltoreports=function(person){
              for(var i=0;i<person.DirectReports.length;i++){
                getEmployee(Number(person.DirectReports[i])).manager=-1;
              }
            };

            this.getemployeeindex=function(person){
              for(var i=0;i<persons.length;i++){
                if(persons[i].id==person.id)
                  return i;
              }
              return ;
            }

            this.idtodetail=function(id){
               for(var i=0;i<persons.length;i++){
                  if(persons[i].id==Number(id))
                    return i;
               }
               return;
            }

            // this.deleteData=function(product){
            //   for(var i=0;i<products.length;i++){
            //      if(products[i]==product){
            //        products.splice(i,1);
            //      }
            //   }
            // }
            // this.getid=function(product){
            //   for(var i=0;i<products.length;i++){
            //      if(products[i]==product){
            //        return i;
            //      }
            //   }
            // }
            // this.edit=function(){

            // }
            });

      myApp.controller('DemoController', function($scope,$http,productCtrl) {
            // Init();
            
            // function Init(){
              $scope.employees=[];
              $scope.barLimit = 6;

            for(var i=0;i<productCtrl.listData().length;i++){
                $scope.employees.push(productCtrl.listData()[i]);
              }
            // }
           

              
            $scope.loadMore = function(){  
              $scope.barLimit+=1;
              // console.log($scope.barLimit);
           };

           // $scope.getdetails=function(person){
           //    // alert(person.id);
           //    productCtrl.pushselected(person);
           //     // $scope.detail=productCtrl.listData()[Number(person.id)];
           //  }

            // $scope.starteditEmployee=function(person){
            //   productCtrl.pushedit(person);
            // }

            var temp='';
            // $scope.term='id';
            $scope.changeOrder=function(t){//change the order type
              $scope.term=t;
              if(t==temp){ 
                $scope.reverse=!$scope.reverse;
              }
              else{
                temp=t;
                $scope.reverse=false;
              }
            }

            $scope.deleteemployee=function(person){

              productCtrl.delete(person);
              if(person.manager!=-1)
              productCtrl.telldeltoboss(person);
              productCtrl.telldeltoreports(person);
            }

            // $scope.sendSMS=function(person){
            //   var index=productCtrl.getemployeeindex(person);
            //   var call=$scope.employees[index].SMS;
            //   var body="Hello! I`m Joey.";
            //   window.location.href = "sms://" + call +"?body=" +body;
            // }

            $scope.sendMail=function(person){
              var index=productCtrl.getemployeeindex(person);
              var email=$scope.employees[index].Email;
              var subject="testing";
              window.location.href = "mailto:" + email + "?subject=" + subject;
            };

            $scope.sendCall=function(person){
              var index=productCtrl.getemployeeindex(person);
              var call=$scope.employees[index].Call_office;
              window.location.href = "callto:" + call;
            }

      });


      myApp.controller('loadController', function($scope,$http,productCtrl) {
        Init();
        function Init(){
        $http.get("employee.json").success(function (response){
        productCtrl.getData(response.data);
        });
        }
      });


      myApp.controller('reportsController', function($scope,$http,productCtrl) {

        $scope.reports=productCtrl.pullreport();
         var temp='';
            // $scope.term='id';
            $scope.changeOrder=function(t){//change the order type
              $scope.term=t;
              if(t==temp){ 
                $scope.reverse=!$scope.reverse;
              }
              else{
                temp=t;
                $scope.reverse=false;
              }
            }

        $scope.managerofpage=productCtrl.idtomanager($scope.reports[0]);
          
      });


      myApp.controller('createCtrl', function($scope,$http,$window,productCtrl) {
        cleaninput();
        function cleaninput(){
          $scope.Name='';
          $scope.picture='';
          $scope.title='';
          $scope.salary='';
          $scope.managerlist='';
          $scope.SMS='';
          $scope.Call_office='';
          $scope.Email='';
          $scope.address='';
        }
  

        
        function getEmployee(){
          var person={};
          person.id=productCtrl.getnewid();
          person.Name=$scope.Name;
          person.picture=productCtrl.pullphoto();
          console.log(person.picture);
          person.title=$scope.title;
          person.salary=$scope.salary;
          person.manager=$scope.managerlist.id;
          person.SMS=$scope.SMS;
          person.Call_office=$scope.Call_office;
          person.Email=$scope.Email;
          person.address=$scope.address;
          person.DirectReports=[];
          return person;
        }

        $scope.createEmployee=function(){
          alert("New employee created");
          // console.log(productCtrl.listData().length);
          var t=getEmployee();
          console.log(t);
          productCtrl.addEmployee(t);
          productCtrl.reporttomanager(t);
        }
        
         $scope.incomplete=true;

         
         $scope.$watch('Name',function() {$scope.test();});
         $scope.$watch('picture',function() {$scope.test();});
         $scope.$watch('title',function() {$scope.test();});
         $scope.$watch('salary',function() {$scope.test();});
         $scope.$watch('managerlist',function() {$scope.test();});
         $scope.$watch('SMS',function() {$scope.test();});
         $scope.$watch('Call_office',function() {$scope.test();});
         $scope.$watch('Email',function() {$scope.test();});
         $scope.$watch('address',function() {$scope.test();});

         $scope.test = function(){  
          // alert($scope.Name.length);
         // alert($scope.managerlist.id);
            
         if((!$scope.Name.length ||
            !$scope.picture.length ||
            !$scope.title.length ||
            !$scope.salary.length ||
            !$scope.managerlist.id ||
            !$scope.SMS.length ||
            !$scope.Call_office.length ||
            !$scope.Email.length ||
            !$scope.address.length)) 
          $scope.incomplete=true;
         else
          $scope.incomplete = false; 

         console.log($scope.incomplete);

          }
        

        $scope.managers=productCtrl.listData();
        // $scope.managerlist;



        });


      myApp.controller('editCtrl', function($scope,$http,productCtrl,$routeParams) {
         
        showprofile();
        // var curmanager=productCtrl.pulledit().manager;

        function showprofile(){
          var ind=productCtrl.idtodetail($routeParams.id);
            var p=productCtrl.listData()[ind];
            // curmanager=p.manager;
            // console.log("show"+curmanager);
            $scope.id=p.id;
            $scope.Name=p.Name;
            $scope.title=p.title;
            $scope.salary=p.salary;
            $scope.manager=p.manager;
            $scope.SMS=p.SMS;
            $scope.Call_office=p.Call_office;
            $scope.Email=p.Email;
            $scope.address=p.address;
            $scope.picture=p.picture;
            $scope.DirectReports=p.DirectReports;

            console.log(p);
        }
        
        function formprofile(){
            var p={};
            p.id=$scope.id;
            p.Name=$scope.Name;
            p.title=$scope.title;
            p.salary=$scope.salary;
            p.manager=$scope.managerlist.id;
            p.SMS=$scope.SMS;
            p.Call_office=$scope.Call_office;
            p.Email=$scope.Email;
            p.address=$scope.address;
            p.picture=$scope.picture;
            p.DirectReports=$scope.DirectReports;
            return p;
        }
        
         $scope.editEmployee=function(){
                 // console.log("edit"+curmanager);     
           var t=formprofile();
           console.log(t);
           productCtrl.editeployeebyid(t);
           productCtrl.reporttomanager(t);
           if(t.maneger!=-1)
           productCtrl.quitamanager(t,curmanager);
           alert("Employee Editted.");
         }

       


         $scope.incomplete=true;

         
         $scope.$watch('Name',function() {$scope.test();});
         $scope.$watch('picture',function() {$scope.test();});
         $scope.$watch('title',function() {$scope.test();});
         $scope.$watch('salary',function() {$scope.test();});
         $scope.$watch('managerlist',function() {$scope.test();});
         $scope.$watch('SMS',function() {$scope.test();});
         $scope.$watch('Call_office',function() {$scope.test();});
         $scope.$watch('Email',function() {$scope.test();});
         $scope.$watch('address',function() {$scope.test();});

         $scope.test = function(){  
          // alert($scope.Name.length);
         // alert($scope.managerlist.id.length);
            
         if((!$scope.Name.length ||
            !$scope.picture.length ||
            !$scope.title.length ||
            !$scope.salary.length ||
            !$scope.managerlist.id ||
            !$scope.SMS.length ||
            !$scope.Call_office.length ||
            !$scope.Email.length ||
            !$scope.address.length)) 
          $scope.incomplete=true;
         else
          $scope.incomplete = false; 
          }
        

        $scope.managers=productCtrl.listData();


      });

      myApp.controller('detailController', function($scope,$http,productCtrl,$routeParams) {
        var ind=productCtrl.idtodetail($routeParams.id);
        // $scope.detail=productCtrl.pullselected();
        $scope.detail=productCtrl.listData()[ind];
        $scope.managername=productCtrl.idtomanager($scope.detail);
        $scope.reportsname=productCtrl.idtoreports($scope.detail);
        // $scope.showManager=function(managerid){
        //    productCtrl.pushmanager(Number(managerid));
        // };
        $scope.showReports=function(reports){
           productCtrl.pushreport(reports);
        };
        $scope.sendMail=function(){
          var email=$scope.detail.Email;
          var subject="testing";
          window.location.href = "mailto:" + email + "?subject=" + subject;
        };

        $scope.sendSMS=function(){
          var sms=$scope.detail.SMS;
          var body="Hello! I`m Joey.";
          window.location.href = "sms://" + sms +"?body=" +body;
        }
        $scope.callOffice=function(){
          var callOffice=$scope.detail.Call_office;
          window.location.href = "callto:" + callOffice;
        };
        
      });

      myApp.config(['$routeProvider',
          function($routeProvider) {
          $routeProvider.
          when('/home', {
            templateUrl: 'home.html',
                      // controller: 'RouteController'
                    }).
          when('/listemployee', {
            templateUrl: 'listemployee.html',
                      // controller: 'RouteController'
                    }).
          when('/detail/:id', {
            templateUrl: 'detail.html',
                      // controller: 'RouteController'
                    }).
          when('/createemployee', {
            templateUrl: 'create.html',
                      // controller: 'RouteController'
                    }).
          // when('/showmanager', {
          //   templateUrl: 'managerdetail.html',
          //             // controller: 'RouteController'
          //           }).
          when('/showreports', {
            templateUrl: 'reportsdetail.html',
                      // controller: 'RouteController'
                    }).
          when('/edit/:id', {
            templateUrl: 'edit.html',
                      // controller: 'RouteController'
                    }).
          when('/camera', {
            templateUrl: 'camera.html',
                      // controller: 'RouteController'
                    }).
          otherwise({
            redirectTo: '/home'
          });
        }]);