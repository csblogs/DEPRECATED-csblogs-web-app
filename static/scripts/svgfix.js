function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // IE 12 => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

function svgfix() {
    function insert() {
        var temp = document.createElement('div');
        temp.innerHTML = request.responseText;
        document.body.insertBefore(temp.firstChild, document.body.firstChild);
        
        replace();
    }
    
    function replace() {
        for (var i = 0; i < uses.length; ++i) {
            var svg = uses[i].parentNode;
            var id = uses[i].getAttributeNS('http://www.w3.org/1999/xlink', 'href').split('#')[1];
            uses[i].setAttribute('xlink:href', '#' + id);
        }
    }
    
    if (detectIE()) {
        var uses = document.getElementsByTagName('use');
        
        if (uses.length > 0) {
            var request = new XMLHttpRequest();
            request.open('GET', '/images/defs.svg');
            request.onload = insert;
            request.send();
        }
    }
}

svgfix();