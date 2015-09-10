var ManuscriptProperties;
var newProperty;
//var peopertiesDiv;
function ManuscriptDefaultProperties(collectionID, manuscriptID, msProperties) {
    this._msProperties = msProperties;
    this._collectionID = collectionID;
    this._manuscriptID = manuscriptID;
    this._ManuscriptProperties = 0;
    var _self = this;

//    peopertiesDiv = newTag("div");
    ManuscriptProperties = newTag("div");
    ManuscriptProperties.text("Please set the following properties:");
    ManuscriptProperties.attr('title', 'Manuscript Properties');
    ManuscriptProperties.append(newTag("div").css('clear', 'both'));
    ManuscriptProperties.dialog({
        draggable: false,
        autoOpen: false,
        height: 500,
        width: 570,
        modal: true,
        buttons: {
            "Save Changes": function () {
                var package = [];
                idx = 0;
                for (var u = 2; u <= this.childElementCount; u++) {
                    var textbox = this.childNodes[u].childNodes[1];
                    if (textbox.value != "") {
                        package[idx] = { id: textbox.id, value: textbox.value };
                        idx = idx + 1;
                    }
                }
                ajaxCall('docService', 'updateMsPropValues', function () { }, ['msID', manuscriptID, 'updatesPkg', package]);

                $(this).dialog("destroy");

                ackMessage = newTag("div");
                ackMessage.text("Manuscript properties have been updated");
                ackMessage.attr('title', 'Successful Update');

                ackMessage.dialog({
                    autoOpen: true,
                    modal: true,
                    buttons: {
                        Ok: function () {
                            $(this).dialog("close");
                        }
                    }
                });

            },

            //TODO: make a dialog with autocomplete functionality - many possible properties
            "Add Property": function () {
                ajaxCall('docService', 'GetAllDocProperties',
                function (defPropResp) {
                    ManuscriptProperties.dialog("destroy");

                    DefaultMsProperties = defPropResp.d;

                    propertySelection = newTag("div");
                    propertySelection.attr("title", "Property Selection");
                    propertySelection.text("Choose property/proeprties to add:");

                    for (iter = 0; iter < DefaultMsProperties.length; iter = iter + 1) {
                        isContained = checkVsManuProperty(DefaultMsProperties[iter], msProperties)

                        if (isContained == false) {

                            var tmpDiv = newTag("div");
                            var inputTag = newTag("input");
                            inputTag.attr("type", "checkbox");
                            inputTag.attr("value", DefaultMsProperties[iter].PropertyID);
                            inputTag.css("margin-right", "10px");
                            inputTag.css("margin-top", "5px");
                            inputTag.attr("name", DefaultMsProperties[iter].PropertyName)
                            inputTag.appendTo(tmpDiv);
                            inputTag.keypress(function (e) { alert(e); })
                            tmpDiv.append($("<label>" + DefaultMsProperties[iter].PropertyName + "<\label>").css("font-weight", "bold"));

                            propertySelection.append(tmpDiv);
                        }

                        propertySelection.dialog({
                            draggable: false,
                            autoOpen: true,
                            modal: true,
                            buttons: {
                                "Confirm": function () {
                                    var idArr = [];
                                    var idx = 0;
                                    // 0 is reserved for the sentence - please ...
                                    for (var f = 1; f <= this.childElementCount; f++) {
                                        var checkbox = this.childNodes[f].childNodes[0];
                                        var isChecked = checkbox.checked;
                                        if (isChecked == true) {
                                            idArr[idx] = checkbox.value;
                                            idx++;
                                        }
                                    }
                                    ajaxCall('docService', 'addNewPropToMs', function () { }, ['msID', _self._manuscriptID, "propertyIDs", idArr]);
                                    $(this).dialog("close");
                                },
                                //send selected property to server
                                "Cancel": function () { $(this).dialog("close"); }
                            }
                        });
                    }
                });
            },

            "Cancel": function () { $(this).dialog("close"); }
        }
    });

    for (iterator = 0; iterator < _self._msProperties.length; iterator = iterator + 1) {
                
        var inputTag = newTag("input");
        inputTag.attr("id", _self._msProperties[iterator].PropertyID);
        inputTag.attr("type", "text");

        if (msProperties[iterator].value == "Empty") {
            inputTag.attr("value", "");
        } else {
            inputTag.attr("value", msProperties[iterator].value);
        }
        

        inputTag.css("margin-top", "10px");
        inputTag.keypress(function (e) {
            this.value = this.value + String.fromCharCode(e.charCode);
        });
        inputTag.keydown(function (e) {
            if (e.which == 8) {
                if (this.value.length>0)
                    this.value = this.value.substring(0, this.value.length - 1);
                e.preventDefault();
            }
            if (e.which == 32) {
                this.value += ' ';
                e.preventDefault();
            }
        });
       
        var propertyDiv = newTag("div");
        propertyDiv.addClass('propertyDiv');
        propertyDiv.append($("<label>" + _self._msProperties[iterator].Name + ":      </label>").css("margin-left", "0.5em"));
        propertyDiv.append(inputTag);
        ManuscriptProperties.append(propertyDiv);
    }

    this._ManuscriptProperties = ManuscriptProperties;
    ManuscriptProperties.dialog("open");


    this.checkVsManuProperty = function (DefaultProperty, msProperties) {
        for (var tr = 0; tr < msProperties.length; tr++) {
            isEqual = msProperties[tr].PropertyID == DefaultProperty.PropertyID;
            if (isEqual == true) {
                return isEqual;
            }
        }
        return false;
    }
}