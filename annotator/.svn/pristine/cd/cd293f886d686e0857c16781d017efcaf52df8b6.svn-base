
function documentManager(mainDiv, tagDocDiv) {
    this._allUsers = 0;
    this._PossibleSchemes = 0;
    this._collections = 0;
    this._mainDiv = mainDiv;
    this._tagDocDiv = tagDocDiv;
    this._curCollTagScheme = 0;
    this._runningAccInd = 0;
    this._lastDocAccInd = 0;

    var _self = this;

    this.init = function () {
        //this._mainDiv.text("HI!");
        ajaxCall('docService', 'GetAllUsers', function (usersResp) { _self._allUsers = usersResp.d; });
        ajaxCall('docService', 'GetUserDocuments', function (resp) { _self.showDocuments(resp); });
        ajaxCall('docService', 'GetAllSchemes', function (schemesResp) { _self.retrieveSchemes(schemesResp); });
    }


    this.showDocuments = function (resp) {
        var accDiv = this._mainDiv.find('#acc1');
        this._collections = resp.d;


        for (var i = 0; i < resp.d.length; i++) {
            var collectionBlock = this.addCollection(resp.d[i]);
            accDiv.append(collectionBlock);
        }

        $("html").addClass("js");
        $.fn.accordion.defaults.container = false;
        $(function () {

            $("#acc1").accordion({
                el: ".h",
                head: "h4, h5",
                next: "div",
                initShow: "div.outer:eq(" + (_self._lastDocAccInd - 1) + ")"
            });
            //            delete ($.ui.accordion.prototype._keydown);
            //            delete ($.ui.accordion.prototype._keypress);
            //            $("#main .accordion").expandAll({
            //                trigger: ".h",
            //                ref: "h4.h",
            //                cllpsEl: "div.outer",
            //                speed: 200,
            //                oneSwitch: false,
            //                instantHide: true
            //            });

            $("html").removeClass("js");

        });

        var activeUsrDiv = newTag("div");
        activeUsrDiv.addClass("activeUsr");
        ajaxCall('docService', 'GetCurrentUserName',
        function (userNameResp) {
            activeUsrDiv.text("Welcome " + userNameResp.d);
            activeUsrDiv.append(newTag('a').attr('href', '/').text('Logout').addClass('logout'));
        });
        
        $(this._mainDiv.find('#header')).append(activeUsrDiv);

        var messageDiv = newTag("div");
        messageDiv.addClass("message");
        messageDiv.hide();
        $(this._mainDiv.find('#header')).append(messageDiv);

        //CollectionDefaultProperties(this._mainDiv, this._PossibleSchemes);
        this._mainDiv.append(newTag("div").addClass('loading'));
    }


    this.addCollection = function (collection) {

        this._runningAccInd++;
        collectionBlock = newTag("li");
        h4_tag = newTag("h4");
        ul_tag = newTag("ul");

        var innerDiv = newTag("div");
        innerDiv.addClass("inner");

        if (collection.IsManager) {
            var collButtonsDiv = newTag("div");
            collButtonsDiv.addClass("collButtons");
            innerDiv.append(collButtonsDiv);


            var collButton = newTag("div");
            collButton.attr("id", "collButtons_" + collection.ID);
            collButton.text('Coll. Settings'); //.css("font-size", "small");
            collButton
			        .button()
			        .click(function () {
			            CollectionDefaultProperties(collection, _self._PossibleSchemes);
			        });
            //.css("margin-left", "825px")
            //.css("margin-top", "-36px");
            //$(this._mainDiv.find('h4')).append(collButton);
            collButton.appendTo(collButtonsDiv);

            var CreateMSButton = newTag("div");
            CreateMSButton.attr("id", "CreateMSButton_" + collection.ID);
            CreateMSButton.text('Add Manuscript');//.css("font-size", "small");
            CreateMSButton
			        .button()
                    .click(function () { window.location.href = 'AddPage.aspx?cid=' + collection.ID })
            //.click(function () {_self.AddManuscript(collection.ID); //CollectionDefaultProperties(collection.ID, _self._PossibleSchemes);});
            CreateMSButton.appendTo(collButtonsDiv);


            manageCollectionDiv = this.CreateManageCollectionDiv(collection);
            collectionBlock.append(manageCollectionDiv);
            h4_tag.text(collection.Title + " (Manager)");
        }
        else {
            h4_tag.text(collection.Title + " "); //(Regular User)");
        }

        for (var i = 0; i < collection.UserManuscripts.length; i++) {
            msBlock = this.addManuscript(collection.UserManuscripts[i], collection);
            ul_tag.append(msBlock);
        }


        innerDiv.append(ul_tag);
        collectionBlock.append(h4_tag);
        collectionBlock.append(innerDiv);

        return collectionBlock;
    }


    this.addManuscript = function (manuscript, collection) {
        this._runningAccInd++;
        msBlock = newTag("li");
        h5_tag = newTag("h5");
        h5_tag.text(manuscript.Title);
        var innerDiv = newTag("div");
        innerDiv.addClass("inner");
        innerDiv.data('manuscript', manuscript);

        var msButtonsDiv = newTag("div");
        msButtonsDiv.addClass("ctrlButtons");
        msButtonsDiv.attr("id", "msButtons");

        var msButton = newTag("div");
        msButton.text('Manuscript Properties');//.css("font-size", "medium");
        msButton.attr("id", "msProp_" + manuscript.ID);
        msButton
    			.button()
    			.click(function () {
    			    ajaxCall('docService', 'addDefPropOfColltoMs', function () {
    			        ajaxCall('docService', 'GetManuProperties',
                        function (manuPropResp) {
                            ManuscriptDefaultProperties(collection.ID, manuscript.ID, manuPropResp.d);
                        }, ["msID", manuscript.ID]);
    			    }, ['msID', manuscript.ID, "collID", collection.ID]);

    			});

        //.css("margin-left", "825px")
        //.css("margin-top", "-36px");
        //$(this._mainDiv.find('h5')).append(msButton);
        msButton.appendTo(msButtonsDiv);
        innerDiv.append(msButtonsDiv);

        if (collection.IsManager) {
            msButtonsDiv.append(
                newTag('div')
                    .text('Add Pages')
                    //.css("font-size", "medium")
                    .click(function () { window.location.href = 'AddPage.aspx?msid=' + manuscript.ID })
                    .button()
            ); //.append(newTag('a').text('Upload')));
            msButtonsDiv.append(
                newTag('div')
                    .text('Hadara Export')
                    .attr('title', 'Export manuscript data in hadara format')
            //.css("font-size", "medium")
                    .click(function () { window.location.href = 'docElementsXml.ashx?format=hadara&msid=' + manuscript.ID })
                    .button()
            );            
        }

        table = newTag("table");
        var tableID = "msTable_" + manuscript.Title;
        table.attr("id", tableID);
        table.addClass("tablesorter");
        tableHead = newTag("thead");
        tableTrHead = newTag("tr");
        tableTH1 = newTag("th").text("Page Title");
        tableTH2 = newTag("th").text("Assigned User");
        tableTH3 = newTag("th").text("Status");

        tableBody = newTag("tbody");
        tableTrHead.append(tableTH1);
        tableTrHead.append(tableTH2);
        tableTrHead.append(tableTH3);

        tableHead.append(tableTrHead);
        table.append(tableHead);


        for (var i = 0; i < manuscript.ManuscriptActivePages.length; i++) {
            if (manuscript.ManuscriptActivePages[i].IsDeleted)
                continue;
            var pageDiv = this.addManuscriptPage(manuscript.ManuscriptActivePages[i], collection);
            var tableTR = newTag("tr");
            var tableTD1 = newTag("td");
            tableTD1.append(pageDiv);

            var pageID = manuscript.ManuscriptActivePages[i].ID;
            if (manuscript.ManuscriptActivePages[i].LastUserDocument)
                this._lastDocAccInd = this._runningAccInd;
            var tableTD2 = newTag("td");
            if (collection.IsManager) {
                var dropDownList = newTag("select");
                var clicknum = 0;
                dropDownList.attr("id", pageID);
                dropDownList.click(function () {
                    clicknum++;
                    if (clicknum == 2) {
                        var userID = $(this).val();
                        var curPageID = this.id;
                        ajaxCall('docService', 'updateAssignedUserID', function () {
                            //for (h = 0; h < _self._allUsers.length; h++) {
                            //if (userID == _self._allUsers[h].ID) {
                            //var str = 'User_' + curPageID;
                            //assigned_td = document.getElementById(str);
                            //assigned_td.innerText = _self._allUsers[h].Name;
                            //}
                            //}
                        }, ['pageID', curPageID, 'userID', userID]);
                        clicknum = 0;
                    }
                });


                //adding none option to the USER list
                optionTag = newTag("option");
                optionTag.text("none");
                optionTag.attr("value", -1);
                if (manuscript.ManuscriptActivePages[i].AssignedToID == null) {
                    optionTag.attr("selected", "selected");
                }
                dropDownList.append(optionTag);

                for (j = 0; j < _self._allUsers.length; j = j + 1) {
                    if (this._allUsers[j].IsActive) {
                        optionTag = newTag("option");
                        optionTag.text(this._allUsers[j].Name);
                        optionTag.attr("value", this._allUsers[j].ID);
                        if (manuscript.ManuscriptActivePages[i].AssignedToID == this._allUsers[j].ID) {
                            optionTag.attr("selected", "selected");
                        }
                        dropDownList.append(optionTag);
                    }
                }
                tableTD2.append(dropDownList);

            } else {

                if (manuscript.ManuscriptActivePages[i].AssignedToUser != null) {
                    tableTD2
                        .text(manuscript.ManuscriptActivePages[i].AssignedToUser.Name)
                        .attr("id", "User_" + pageID);
                } else {
                    tableTD2
                        .text("Not Assigned")
                        .attr("id", "User_" + pageID);
                }
            }


            var posSts = ["UnTagged", "Tagged", "Approved"];
            var tableTD3 = newTag("td");

            if (collection.IsManager) {
                var dropDownListSts = newTag("select");
                var clicknum = 0;
                dropDownListSts
                             .attr("id", pageID)
                             .click(function () {
                                 clicknum++;
                                 if (clicknum == 2) {
                                     var status = $(this).val();
                                     var curPageID = this.id;
                                     ajaxCall('docService', 'updateStatus', function () { }
                                     , ['pageID', curPageID, 'status', status]);
                                     clicknum = 0;
                                 }
                             });

                for (var sts = 0; sts < 3; sts = sts + 1) {

                    var optionTag = newTag("option");
                    optionTag.text(posSts[sts]);
                    optionTag.attr("value", sts);
                    if (manuscript.ManuscriptActivePages[i].Status == sts) {
                        optionTag.attr("selected", "selected");
                    }
                    dropDownListSts.append(optionTag);
                }

                tableTD3.append(dropDownListSts);
            } else {
                tableTD3.text(posSts[manuscript.ManuscriptActivePages[i].Status]);
            }

            var tableTD4 = newTag("td");

                tableTD4.append(
                        newTag("div").append(
                            newTag("a")
                                .text("xml")
                                .attr('download', '' + manuscript.ManuscriptActivePages[i].Title + '.xml')
                                .addClass("clickable")
                                .attr('href', 'docElementsXml.ashx?docID=' + pageID)
                                .attr('target', '_blank')
                                .attr('title', 'Export as xml')
                                )
                            );
                tableTD4.append(newTag('div').text('|').css('float', 'left'));

                tableTD4.append(
                    newTag("div").append(
                        newTag("a")
                            .text("hadara")
                            .attr('download', '' + manuscript.ManuscriptActivePages[i].Title + '.xml')
                            .addClass("clickable")
                            .attr('href', 'docElementsXml.ashx?format=hadara&docID=' + pageID)
                            .attr('target', '_blank')
                            .attr('title', 'Export as hadara xml')
                            )
                        );
                tableTD4.append(newTag('div').text('|').css('float', 'left'));

                tableTD4.append(
                    newTag("div").append(
                        newTag("a")
                            .text("csv")
                            .attr('download', '' + manuscript.ManuscriptActivePages[i].Title + '.csv')
                            .addClass("clickable")
                            .attr('href', 'docElementsXml.ashx?format=csv&docID=' + pageID)
                            .attr('target', '_blank')
                            .attr('title', 'Export as csv')
                            )
                        );

            if (collection.IsManager) {
                tableTD4.append(newTag('div').text('|').css('float', 'left'));
                tableTD4.append(
                    newTag("div")
                        .text("x")
                        .addClass("clickable")
                        .attr('title', 'Delete page')
                        .data('pageID', pageID)
                        .click(function () {
                            if (confirm('are you sure you want to delete this manuscript page?'))
                                ajaxCall('docService', 'DeletePage', function () { /*window.location = window.location; */
                                    //tableTR.remove(); 
                                    this.parent().parent().hide()
                                }, ['docID', $(this).data('pageID')], $(this));
                        })
                );
                // rename, leave for now
                //                tableTD4.append(($('<input type=text />')));
                //                tableTD4.append(
                //                    newTag("div")
                //                        
                //                        .text("r")
                //                        .addClass("clickable")
                //                        .attr('title', 'Rename')
                //                        .data('pageID', pageID)
                //                        .click(function () {
                //                            //alert('rename');
                //                            //                            if (confirm('are you sure you want to delete this manuscript page?'))
                //                            ajaxCall('docService', 'RenamePage', function () { window.location = window.location; }, ['docID', $(this).data('pageID'), 'newName', $(this).paretn]);
                //                        })
                //                );
            }

            tableTR.append(tableTD1);
            tableTR.append(tableTD2);
            tableTR.append(tableTD3);
            tableTR.append(tableTD4);

            tableBody.append(tableTR);
        }

        table.append(tableBody);
        innerDiv.append(table);

        msBlock.append(h5_tag);
        msBlock.append(innerDiv);

        return msBlock;
    }


    this.addManuscriptPage = function (page, collection) {

        pageDiv = newTag("div");
        pageDiv.addClass("clickable");
        pageDiv.addClass("msPages");
        pageDiv
                .click(function () {
                    var page = $(this).data('page');
                    ajaxCall('docService', 'GetCurTagScheme', function (updateResp) {
                        _self._curCollTagScheme = updateResp.d;
                        var gte = new GTEditor(_self, _self._curCollTagScheme, _self._tagDocDiv, page);
                        _self._mainDiv.find('.loading').fadeIn();
                        gte.Load(
                            function () {
                                _self.hide(
                                    function () {
                                        _self._mainDiv.find('.loading').hide();
                                        gte.show();
                                    });

                            }
                        );
                    }, ['collID', collection.ID]);
                })
            .data("page", page)
            .text(page.Title);
        return pageDiv;
    }

    this.CreateManageCollectionDiv = function (collection) {
        var div = newTag("div")
        .addClass("divCollectionManager");
        //div.append(CollectionDefaultProperties(collection));
        return div;
    }

    this.hide = function (callback) {
        this._mainDiv.fadeOut('slow', callback);
    }

    this.show = function (callback) {
        this._mainDiv.fadeIn('slow', callback);
    }

    this.retrieveSchemes = function (schemesResp) {
        this._PossibleSchemes = schemesResp.d;
    }

    this.getSelectedItem = function (dropDownList) {
        for (k = 0; k < dropDownList.options.length; k++) {
            if (dropDownList.options[k].selected == true) {
                return dropDownList.options[k].value;
            }
        }
    }
    this.AddManuscript = function (collectionID) {

        var addMsDlg = newTag("div");

        addMsDlg.attr('title', 'Create new Manuscript');
        addMsDlg.append(
            newTag("div").css('clear', 'both').text('Manuscript Title:')
                .append(
                    newTag('input').attr('id', 'a123').attr('type', 'text')
                        .keypress(function (e) {
                            this.value = this.value + String.fromCharCode(e.charCode);
                        })
                        .keydown(function (e) {
                            if (e.which == 8) {
                                if (this.value.length > 0)
                                    this.value = this.value.substring(0, this.value.length - 1);
                                e.preventDefault();
                            }
                            if (e.which == 32) {
                                this.value += ' ';
                                e.preventDefault();
                            }
                        })
                ));
        addMsDlg.dialog({
            draggable: true,
            autoOpen: true,
            height: 200,
            width: 350,
            modal: true,
            buttons: {
                "Create": function () {
                    ajaxCall('docService', 'CreateManuscript',
                        function () {
                            window.location.href = window.location;
                        },
                        ['collectionID', collectionID, 'title', $(this).find('input').val()]);
                },
                "Cancel": function () { $(this).dialog("close"); }
            }
        });
    }
}


