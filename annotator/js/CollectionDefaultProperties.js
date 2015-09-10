﻿var dropDownList;
function CollectionDefaultProperties(collection, PossibleSchemes) {
    var collectionID = collection.ID;
    var clicknum = 0;
    var collectionSettings = newTag("div");
    collectionSettings.text("Please choose a scheme:");
    collectionSettings.attr('title', 'Collection Settings');

    var schemeDiv = newTag("div");
    schemeDiv.append($("<label style=margin-right:2em;>Scheme:</label>"));
    dropDownList = newTag("select");
    dropDownList.attr("id", "dropdown1")

    for (iterator = 1; iterator < PossibleSchemes.length; iterator = iterator + 1) {
        optionTag = newTag("option");
        optionTag.text(PossibleSchemes[iterator].Name);
        optionTag.attr("value", iterator);
        dropDownList.append(optionTag);
        if (PossibleSchemes[iterator].Name == collection.Scheme.Name)
            optionTag.attr('selected', true);
    }

    schemeDiv.append(dropDownList);
    collectionSettings.append(schemeDiv);

    var defPropDiv = newTag("div");
    defPropDiv.text("Please choose default manuscript properties for this collection: ");
    defPropDiv.css("margin-top", "20px");
    ajaxCall('docService', 'GetAllDocProperties',
                function (defPropResp) {
                    DefaultProperties = defPropResp.d;

                    for (iter = 0; iter < DefaultProperties.length; iter = iter + 1) {

                        var tmpDiv = newTag("div");
                        var inputTag = newTag("input");
                        inputTag.attr("type", "checkbox");
                        inputTag.attr("value", DefaultProperties[iter].PropertyID);
                        inputTag.css("margin-right", "10px");
                        inputTag.css("margin-top", "5px");
                        inputTag.attr("name", DefaultProperties[iter].PropertyName)
                        inputTag.appendTo(tmpDiv);
                        inputTag.keypress(function (e) { alert(e); })
                        tmpDiv.append($("<label>" + DefaultProperties[iter].PropertyName + "<\label>").css("font-weight", "bold"));

                        defPropDiv.append(tmpDiv);
                        collectionSettings.append(defPropDiv);
                    }
                });


    collectionSettings.dialog({
        draggable: false,
        autoOpen: false,
        height: 500,
        width: 500,
        modal: true,
        buttons: {
            "Confirm": function () {

                var schemeName = getSelectedItem(dropDownList);
                ajaxCall('docService', 'SetCollectionScheme',
                function () {

                    collectionSettings.dialog("destroy");

                    schemeUpdateMessage = newTag("div");
                    schemeUpdateMessage.text("Congrats! Settings have been changed succesfully.").css("font-weight", "bold");
                    schemeUpdateMessage.attr('title', 'Settings Update');
                    
                    schemeUpdateMessage.dialog({
                        autoOpen: true,
                        modal: true,
                        buttons: {
                            Ok: function () {
                                $(this).dialog("close");
                            }
                        }
                    });
                }, ['collectionID', collectionID, 'schemeID', schemeName]);


                var idArr = [];
                var idx = 0;
                // 0 is reserved for the sentence - please ...
                var len = this.childNodes[2].childElementCount;
                for (var f = 1; f <= len; f++) {
                    var checkbox = this.childNodes[2].childNodes[f].childNodes[0];
                    var isChecked = checkbox.checked;
                    if (isChecked == true) {
                        idArr[idx] = checkbox.value;
                        idx++;
                    }
                }

                ajaxCall('docService', 'addNewPropToColl', function (resp) { }, ['collID', collectionID, "propertyIDs", idArr]);



            },
            Cancel: function () { $(this).dialog("close"); }
        }

    });

    
    collectionSettings.dialog("open");


    this.getSelectedItem = function (dropDownList) {
        for (var k = 0; k < dropDownList[0].length; k++) {
            if (dropDownList[0][k].selected == true) {
                c = k;
            }
            dropDownList[0][k].selected = false;
        }
        return dropDownList[0][c].value;
    }
}