function pad(str, max) {
    str = str.toString();
    str = str.length < max ? pad("0" + str, max) : str;
    return str.slice(-max);
};

$(document).ready(function() {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
});

var IChronoApp = angular.module('IChronoApp', []).config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{!');
    $interpolateProvider.endSymbol('!}');
}]);

IChronoApp.controller('IChronoController', function($scope, $interval) {

    var incrementValue = 7;
    var promisse; // Store the result of $interval call

    var chrono = this;
    chrono.hours = "00"
    chrono.minutes = "00"
    chrono.seconds = "00"
    chrono.miliseconds = "000"
    chrono.States = {
        STOPPED: 0,
        PAUSED: 1,
        COUNTING: 2
    }

    chrono.buttonControls = {
        fst: {
            icon: "glyphicon-play",
            label: "Iniciar",
            state: ""
        },

        snd: {
            icon: "glyphicon-stop",
            label: "Resetar",
            state: "disabled"
        },

        thd: {
            icon: "glyphicon-floppy-disk",
            label: "Salvar",
            state: "disabled"
        }
    }

    chrono.elapsedTimeInMS = 0;

    chrono.currState = chrono.States.STOPPED;

    promisse = $interval(function() {
        if (chrono.currState != chrono.States.COUNTING)
            return;
        chrono.elapsedTimeInMS += incrementValue;

        chrono.updateView();
    }, incrementValue);

    chrono.updateView = function() {
        var date = new Date(chrono.elapsedTimeInMS);
        chrono.hours = pad(date.getUTCHours() + (date.getUTCDate() - 1) * 24, 2);
        chrono.minutes = pad(date.getUTCMinutes(), 2);
        chrono.seconds = pad(date.getUTCSeconds(), 2);
        chrono.miliseconds = pad(date.getUTCMilliseconds(), 3);
    }

    chrono.start = function() {
        if (chrono.currState != chrono.States.COUNTING) {
            chrono.currState = chrono.States.COUNTING;
            chrono.buttonControls = {
                fst: {
                    icon: "glyphicon-pause",
                    label: "Pausar",
                    state: ""
                },

                snd: {
                    icon: "glyphicon-stop",
                    label: "Resetar",
                    state: ""
                },

                thd: {
                    icon: "glyphicon-floppy-disk",
                    label: "Salvar",
                    state: ""
                }
            }
        } else chrono.pause();
    }

    chrono.pause = function() {
        if (chrono.currState == chrono.States.PAUSED)
            return;
        if (chrono.currState == chrono.States.COUNTING) {
            chrono.currState = chrono.States.PAUSED;
            chrono.buttonControls = {
                fst: {
                    icon: "glyphicon-play",
                    label: "Retomar",
                    state: ""
                },

                snd: {
                    icon: "glyphicon-stop",
                    label: "Resetar",
                    state: ""
                },

                thd: {
                    icon: "glyphicon-floppy-disk",
                    label: "Salvar",
                    state: ""
                }
            }
        }
    }

    chrono.reset = function() {
        if (chrono.currState == chrono.States.STOPPED)
            return;
        chrono.currState = chrono.States.STOPPED;
        chrono.buttonControls = {
            fst: {
                icon: "glyphicon-play",
                label: "Iniciar",
                state: ""
            },

            snd: {
                icon: "glyphicon-stop",
                label: "Resetar",
                state: "disabled"
            },

            thd: {
                icon: "glyphicon-floppy-disk",
                label: "Salvar",
                state: "disabled"
            }
        }
        chrono.elapsedTimeInMS = 0;
        chrono.updateView();
    }

    chrono.save = function() {
        if (chrono.currState == chrono.States.STOPPED)
            return;

        //console.log(time);
        var currtime = chrono.hours + ":" + chrono.minutes + ":" + chrono.seconds + ":" + chrono.miliseconds;

        $.ajax({
            type: "POST",
            url: "/times",
            datatype: "json",
            success: function(msg) {
                $('#times').append('<h4><span class="label label-info">'+currtime+'</span></h4>');
            },
            data: {
                time : currtime
            }
        });
    }
});
