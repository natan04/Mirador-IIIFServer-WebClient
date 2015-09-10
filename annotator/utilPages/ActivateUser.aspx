﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ActivateUser.aspx.cs" Inherits="utilPages_ActivateUser" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
     <asp:Repeater runat="server" ID="rptUsrs" onitemcommand="rptUsrs_ItemCommand">
        <ItemTemplate>
            <asp:LinkButton runat="server" ID="lbActivateUser" uid='<%#Eval("ID")%>' OnClick="ActivateUser">Activate</asp:LinkButton> <%#Eval("Email")%>, <%#Eval("FirstName")%> <%#Eval("LastName")%>, <%#Eval("Institute")%><br />
        </ItemTemplate>
     </asp:Repeater>
    </div>
    <hr />
    impersonate user <asp:TextBox runat="server" ID="tbImpersonateUserName"></asp:TextBox> 
    <asp:LinkButton runat="server" ID="lbImpersonate" onclick="lbImpersonate_Click">Go</asp:LinkButton>
    </form>
</body>
</html>
