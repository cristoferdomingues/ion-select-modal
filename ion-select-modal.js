'use strict';

var ionSelectModal = angular.module('ionSelectModal', ['ionic']);
//Relative Path
var scripts = document.getElementsByTagName("script");
var currentScriptPath = scripts[scripts.length - 1].src;
var modalTemplatePath = currentScriptPath.replace('ion-select-modal.js', 'ion-select-modal.html')
var templatePath2 = currentScriptPath.replace('ion-select-modal.js', 'ion-select-element.html');

ionSelectModal.directive('ionSelectModal', function ($timeout, $ionicModal, $ionicScrollDelegate) {
    return {
        restrict: 'EAC',
        scope: {
            label: '@',
            labelField: '@',
            provider: '=',
            ngModel: '=?',
        },
        require: '?ngModel',
        transclude: false,
        replace: false,
        templateUrl: templatePath2,
        link: function (scope, element, attrs, ngModel) {
            $ionicModal.fromTemplateUrl(modalTemplatePath, {
                scope: scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                scope.modal = modal;
            });
            scope.openModal = function () {
                scope.modal.show();
            };
            scope.closeModal = function () {
                scope.modal.hide();
            };
            //Cleanup the modal when we're done with it!
            scope.$on('$destroy', function () {
                scope.modal.remove();
            });
            // Execute action on hide modal
            scope.$on('modal.hidden', function () {
                scope.modal.filtro = '';
            });
            // Execute action on remove modal
            scope.$on('modal.removed', function () {
                // Execute action
            });

            var _removeCheckFromItem = function (callback) {
                angular.forEach(scope.provider, function (obj, idx) {
                    delete obj.checked;
                    if ((idx + 1) === scope.provider.length) {
                        if (callback) {
                            callback();
                        }

                    }
                });
            }

            var _selecionarItemHandler = function (item) {
                _removeCheckFromItem(function () {
                    item.checked = true;
                });
            };

            scope.selecionar = function (item) {

                ngModel.$setViewValue(item);
                ngModel.$render();
                _selecionarItemHandler(item);
                scope.closeModal();
            };

            scope.resetInput = function () {
                _removeCheckFromItem();
                ngModel.$setViewValue(null);
                ngModel.$render();
            };

            scope.$watch('ngModel', function (newValue, oldValue) {
                if (angular.isObject(newValue) || newValue === '') {
                    console.log(newValue);
                    if (newValue !== oldValue) {
                        if (newValue) {
                            console.log(newValue[scope.labelField]);
                            element.find('input').val(newValue[scope.labelField]);
                        }
                    }
                }
            });

            scope.$watch('modal.filtro', function (newValue) {
                console.log('modal.filtro watch', newValue);
                scope.$broadcast('SCROLL_TOP');
            });

            var listScroll = $ionicScrollDelegate.$getByHandle('modal.listScroll');
            scope.$on('SCROLL_TOP', function () {
                console.log('scope.SCROLL_TOP');
                $timeout(function () {
                    listScroll.scrollTop(true, true);
                }, 150);

            });
        }
    };
}).filter('dynamicFilter', ["$filter",
  function ($filter) {
        return function (array, keyValuePairs) {
            var obj = {},
                i;
            for (i = 0; i < keyValuePairs.length; i += 2) {
                if (keyValuePairs[i] && keyValuePairs[i + 1]) {
                    obj[keyValuePairs[i]] = keyValuePairs[i + 1];
                }
            }
            return $filter('filter')(array, obj);
        };
  }
]).filter('highlight', function () {
    'use strict';

    return function (text, search, caseSensitive) {
        if (text && (search || angular.isNumber(search))) {
            text = text.toString();
            search = search.toString();
            if (caseSensitive) {
                return text.split(search).join('<span class="ui-match">' + search + '</span>');
            } else {
                return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
            }
        } else {
            return text;
        }
    };
});