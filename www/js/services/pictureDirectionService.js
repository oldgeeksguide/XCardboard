var pictureDirectionService = function ($rootScope, settingsService) {

    // If the Gyroscope is available, you probably want to use it, otherwise
    // you can try the compass.  For now, just set it directly here,
    // but ideally we want to automatically detect and choose.
    var compassOrGyro = "gyro";
    // compassOrGyro = "compass";  // Uncomment this if you want to use the compass

    useGyro = function() {
        // Relies on https://github.com/zanderso/cordova-plugin-gyroscope.git
        // plugin-id == "org.dartlang.phonegap.gyroscope"
        var lastHeading = 0;

        var onSuccess = function (rotationalSpeed) {
            var pictureWidth = $rootScope.imageWidth;
            var picturePosition = 0;
            var newHeading = lastHeading;
            var delta = 4;
            var epsilon = 0.2;

            speed = rotationalSpeed.x;

            if (speed > epsilon) {
                // Conversion of speed to position arrived at empirically :-)
                newHeading = (lastHeading + 360-Math.round(delta*Math.sqrt(speed))) % 360;
                picturePosition = Math.abs(Math.round(pictureWidth / 360 * newHeading));
                $rootScope.$broadcast("picturePositionChanged", picturePosition);
            } else if (speed < -epsilon) {
                newHeading = (lastHeading + Math.round(delta*Math.sqrt(-speed))) % 360;
                picturePosition = Math.abs(Math.round(pictureWidth / 360 * newHeading));
                $rootScope.$broadcast("picturePositionChanged", picturePosition);
            }
            lastHeading = newHeading;
        };

        var onError = function (gyroscopeError) {
            // TODO: Debug Mode and check of Sensor availible
            console.log('Gyroscope error: ', gyroscopeError.code);
        };

        var options = {
            frequency: 200
        };

        return function () {
            navigator.gyroscope.watchAngularSpeed(onSuccess, onError, options);
        };
    };

    useCompass = function() {
        var lastMagneticHeading = 0;

        var onSuccess = function (heading) {
            var pictureWidth = $rootScope.imageWidth;
            var rest = heading.magneticHeading - lastMagneticHeading;

            if (rest >= settingsService.compassAdjustment || rest <= -settingsService.compassAdjustment) {
                var picturePosition = Math.abs(Math.round(pictureWidth / 360 * heading.magneticHeading));
                $rootScope.$broadcast("picturePositionChanged", picturePosition);

                lastMagneticHeading = heading.magneticHeading;
            }
        };

        var onError = function (compassError) {
            // TODO: Debug Mode and check of Sensor availible
            //alert('Compass error: ' + compassError.code);
        };

        var options = {
            frequency: 50
        };

        return function () {
            navigator.compass.watchHeading(onSuccess, onError, options);
        };
    };

    if (compassOrGyro == "gyro") {
        initialize = useGyro();
    } else if (compassOrGyro == "compass") {
        initialize = useCompass();
    } else {
        alert("Need to choose compass or gyro");
    }

    return {
        initialize: initialize
    };
};

pictureDirectionService.$inject = ["$rootScope", "settingsService"];
