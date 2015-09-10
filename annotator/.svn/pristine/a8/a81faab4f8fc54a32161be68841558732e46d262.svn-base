<%@ Page Language="C#" AutoEventWireup="true" CodeFile="AddPage.aspx.cs" Inherits="AddPage" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>WebGT - add manuscript page</title>
    <link href="css/login_page.css" rel="stylesheet" type="text/css" media="screen" />
    <script type="text/javascript" src="js/jquery-1.7.2.min.js"></script>
    <script type="text/javascript">

        $(document).ready(function () {
            $('.addPage').hide();
            $('.addPage:first').show();
            $('.addPage').click(
                function () {
                    $(this).next().show();
                });

        });
    </script>
</head>
<body>
    <form id="form1" runat="server">
    <div id="wrapper">
   
    <div id="header">
	    <p></p>
    </div>
    <div id="page" style="padding:0 150px 0 150px;color:Black;width:1000px;">
        <p style="font-size:large;"><asp:Label runat="server" ID="lblTitle"></asp:Label></p>
        <asp:Label runat="server" ID="lblMsg" style="color:Red;"></asp:Label>
        <asp:panel runat="server" ID="pnlAddManuscript" Visible="false" style="font-size:large;">
            Manuscript Title : <asp:TextBox runat="server" ID="tbManuscriptTitle" Width="250"></asp:TextBox><br />
            <br />
            ManuscriptPages:<br /><br />
        </asp:panel>
        <asp:Repeater ID="Repeater1" runat="server" >
            <ItemTemplate>
                <div class="addPage">
                    <asp:FileUpload ID="fuImg" runat="server" />
                    Title: 
                    <asp:TextBox ID="tbTitle" runat="server"></asp:TextBox>
                </div>
            </ItemTemplate>
        </asp:Repeater>
        <asp:LinkButton ID="LinkButton1" runat="server" onclick="LinkButton1_Click" style="font-size:large">Add pages</asp:LinkButton>
    </div>
    </form>
</body>
</html>
