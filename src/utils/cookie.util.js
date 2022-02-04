function setCookie(name, value, expiry) {
  var d = new Date();
  d.setTime(d.getTime() + expiry * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  var cookie = name + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookieArray = decodedCookie.split(";");
  for (var i = 0; i < cookieArray.length; i++) {
    var c = cookieArray[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(cookie) == 0) {
      return c.substring(cookie.length, c.length);
    }
  }
  return "";
}

export { setCookie, getCookie };
