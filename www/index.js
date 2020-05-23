function formatNow() {
  var now = new Date();
  return (
    now.getHours() +
    ":" +
    now.getMinutes() +
    ":" +
    now.getSeconds() +
    "." +
    now.getMilliseconds()
  );
}

function addToLog(log) {
  document.getElementById("notification-logs").innerHTML =
    "<hr>" +
    "<p>Received at " +
    formatNow() +
    "</p>" +
    log +
    document.getElementById("notification-logs").innerHTML;
}

function trySomeTimes(func, onSuccess, onFailure, customTries) {
  var tries = typeof customTries === "undefined" ? 100 : customTries;
  var interval = setTimeout(function () {
    if (typeof func !== "function") {
      onSuccess("Unavailable");
      return;
    }
    func(
      function (result) {
        if ((result !== null && result !== "") || tries < 0) {
          onSuccess(result);
        } else {
          trySomeTimes(func, onSuccess, onFailure, tries - 1);
        }
      },
      function (e) {
        clearInterval(interval);
        onFailure(e);
      }
    );
  }, 100);
}

function setupOnTokenRefresh() {
  FCMPlugin.onTokenRefresh(
    function (token) {
      addToLog("<p>FCM Token refreshed to " + token + "</p>");
    },
    function (error) {
      addToLog("<p>Error on refreshing FCM Token: " + error + "</p>");
    }
  );
}

function setupOnNotification() {
  FCMPlugin.onNotification(function (data) {
    addToLog("<pre>" + JSON.stringify(data, null, 2) + "</pre>");
  });
}

function logFCMToken() {
  trySomeTimes(
    FCMPlugin.getToken,
    function (token) {
      addToLog("<p>Started listening FCM as " + token + "</p>");
    },
    function (error) {
      addToLog("<p>Error on listening for FCM token: " + error + "</p>");
    }
  );
}

function logAPNSToken() {
  if (cordova.platformId !== "ios") {
    return;
  }
  FCMPlugin.getAPNSToken(
    function (token) {
      addToLog("<p>Started listening APNS as " + token + "</p>");
    },
    function (error) {
      addToLog("<p>Error on listening for APNS token: " + error + "</p>");
    }
  );
}

function setupClearAllNotificationsButton() {
  document.getElementById("clear-all-notifications").addEventListener(
    "click",
    function () {
      FCMPlugin.clearAllNotifications();
    },
    false
  );
}

function waitForPermission(callback) {
  FCMPlugin.requestPushPermissionIOS(
    function (didIt) {
      if (didIt) {
        callback();
      } else {
        addToLog("<p>Push permission was not given to this application</p>");
      }
    },
    function (error) {
      addToLog("<p>Error on checking permission: " + error + "</p>");
    }
  );
}

function setupListeners() {
  waitForPermission(function () {
    FCMPlugin.createNotificationChannelAndroid({
      id: "sound_alert6",
      name: "Sound Alert6",
      // description: "Useless",
      importance: "high",
      // visibility: "public",
      sound: "elet_mp3",
      // lights: false,
      // vibration: false,
    });
    logFCMToken();
    logAPNSToken();
    setupOnTokenRefresh();
    setupOnNotification();
    setupClearAllNotificationsButton();
  });
}

document.addEventListener("deviceready", setupListeners, false);
