﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="tempExport.aspx.cs" Inherits="tempExport" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
        <asp:DropDownList runat="server" ID="ddlCollection" AutoPostBack="True" 
            onselectedindexchanged="ddlCollection_SelectedIndexChanged" Width="200px"></asp:DropDownList><br />
        <br />
        <asp:DropDownList runat="server" ID="ddlManuscript" AutoPostBack="True" 
            onselectedindexchanged="ddlManuscript_SelectedIndexChanged" Width="200px"></asp:DropDownList>
        <br />
        <br />
        page: 
        <asp:DropDownList ID="ddlSelectDoc" runat="server"  Width="200px"></asp:DropDownList>
        <br />
        <br />
        <asp:LinkButton runat="server" ID="lbExportToCsv" onclick="lbExportToCsv_Click">Export to CSV</asp:LinkButton> 
        <br />
        <br />
        <asp:LinkButton runat="server" ID="lbImportFromCsv" 
            onclick="lbImportFromCsv_Click" >Import from CSV</asp:LinkButton> 
        &nbsp;:
        <asp:FileUpload ID="FileUpload1" runat="server" />
        <br />
        <br />
        <asp:LinkButton runat="server" ID="lbUploadImage" onclick="lbUploadImage_Click">Upload page Image</asp:LinkButton>&nbsp;:
        <asp:FileUpload ID="fuDocImage" runat="server"/>
        <br />
        <br />
    </div>
    <hr />
    <h4>new page</h4>
    <br />
    title: <asp:TextBox runat="server" ID="tbTitle"></asp:TextBox><br />
    image: <asp:FileUpload runat="server" ID="fuNewPage" /><br />
    <asp:LinkButton runat="server" ID="lbCreate" onclick="lbCreate_Click">Create</asp:LinkButton>
    <hr />
    <h4>Create collection</h4>
    title: <asp:TextBox runat="server" ID="tbCollectionTitle"></asp:TextBox><br />
    Owner(userName):<asp:TextBox runat="server" ID="tbOwnerUserName"></asp:TextBox>
    <br />
    <br />
    <asp:LinkButton runat="server" ID="lbCreateCollection" Text="Create" 
        onclick="lbCreateCollection_Click"></asp:LinkButton>
    <hr />
    <h4>Set user password</h4>
    User:<asp:TextBox runat="server" ID="tbSetPassUserName"></asp:TextBox><br />
    new Pass: <asp:TextBox runat="server" ID="tbSetPassPassword" 
        TextMode="Password"></asp:TextBox><br />
    <asp:LinkButton runat="server" ID="lbSetPass" onclick="lbSetPass_Click">Set</asp:LinkButton>
    <hr />
    <asp:Label runat=server ID="lbMsg"></asp:Label>
    </form>
    <p>
        &nbsp;</p>
</body>
</html>
