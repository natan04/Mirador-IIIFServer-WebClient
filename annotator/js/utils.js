function ajaxCall(serviceName, funcName, success, args,context) {
    var webMethod = serviceName + '.asmx/' + funcName;
    if (typeof args == 'undefined')
        args = [];
    var parameters = "{"
    for (i = 0; i < args.length; i = i + 2) {
        if (i > 1) parameters = parameters + ",";
        parameters += "'" + args[i] + "':"+JSON.stringify(args[i + 1] );
    }
    parameters = parameters + "}";
    //                var parameters = "{'sDate':'" + sDate + "','eDate':'" + eDate + "'}"

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: success,
        context:context,
        //        function (msg) {
        //            markLetter(msg.d);
        //        },
        error: function (e) {
            //alert("Service Unavailable");
            
            if (e.responseText.indexOf('No user is currently connected') > 0)
                window.location.href = './';
            else
                message(e.responseText);

        }
    });
}

function newTag(tag) {
    return $('<' + tag + '></' + tag + '>');
}

function newDiv() {
    return newTag('div');
}

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
    });
};



function isInRect(el, container) {
    var com = getCenterPoint(el);
    return isPtInRect(com, container);

}

function getCenterPoint(element) {
    return {
        X: Math.round(element.css('left').replace('px', '')) + element.width() / 2,
        Y: Math.round(element.css('top').replace('px', '')) + element.height() / 2
    };
}

function isPtInRect(pt, container) {
    var cnt = {
        xFrom: Math.round(container.css('left').replace('px', '')),
        yFrom: Math.round(container.css('top').replace('px', ''))
    };
    cnt.xTo = cnt.xFrom + container.width();
    cnt.yTo = cnt.yFrom + container.height();

    return (
        pt.X > cnt.xFrom &&
        pt.X < cnt.xTo &&
        pt.Y > cnt.yFrom &&
        pt.Y < cnt.yTo);
}

function message(str) {
    var messageDiv = $(".message");
    message.text(str);
    messageDiv.show('slow');
    
}

function urlParam(name) {
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) return null;
    return results[1] || 0;
}