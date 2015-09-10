﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>WebGT - Web based ground truthing system</title>
    <link href="css/login_page.css" rel="stylesheet" type="text/css" media="screen" />
    <script type="text/javascript" src="js/jquery-1.7.2.min.js"></script>
   <script type="text/javascript">
       $(document).ready(function () {
           $.browser.chrome = $.browser.webkit && !!window.chrome;
           if (!$.browser.chrome) {
               alert('Sorry, the site currently works only on chrome browser.');
               $('input')
                    .click(function () { return false; })
                    .prop('disabled', true);
           }
       });
    </script>
    <!-- google analytics code -->
    <script type="text/javascript">
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-44571095-1']);
        _gaq.push(['_trackPageview']);

        (function () {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
    </script>
</head>
<body>
    
<div id="wrapper">
<!-- start header -->
<div id="header">
	<p></p>
</div>
<!-- end header -->
<!-- start page -->
<div id="page">
	<!-- start content -->
	<div id="content">
		<hr/>
		<form id="form1" runat="server">
        <asp:Panel ID="Panel1" runat="server" DefaultButton="lbLogin">
            <div>
            <p class="meta">
              <font color="green"><b> Email:</b> </font><asp:TextBox runat="server" ID="tbEmail" TabIndex="1"></asp:TextBox>
               <font color='green'> <b> Password: </b> </font><asp:TextBox runat="server" ID="tbPassword" 
                    TextMode="Password" TabIndex="2"></asp:TextBox>
                <asp:Button runat="server" ID="lbLogin" onclick="lbLogin_Click" TabIndex="3" Text="login"></asp:Button>
                
            </p>
            </div>
            <div style="color:Red;text-align:center;"><asp:Label ID="lblMsg" runat="server" ></asp:Label></div>
        </asp:Panel>
    
		
		
		<hr/>
		
		<div class="post">
			<div class="entry" align="center">
			
				<div class='temp'><img  align='left' hspace="50" vspace="40" width='40%' src="css/images/img01.jpg" alt="History!" /></div>	
				<div id="entry_right">
				<h1><font color='#FFFF00'>Sign Up</font></h1>
				<h2><font color='#FFFF00'>It's free and anyone can join ..</font></h2>
		 			<table>
			 		
                    <tr><td> <b>Email:</b></td>
			  		<td><asp:TextBox runat="server" id="rgEmail" TabIndex="4"></asp:TextBox></td></tr>
		     		
                    <tr><td> <b>First Name:</b></td>
			  		<td><asp:TextBox runat="server" id="rgFname" TabIndex="5"></asp:TextBox></td></tr>

                    <tr><td> <b>Last Name:</b></td>
			  		<td><asp:TextBox runat="server" id="rgLname" TabIndex="6"></asp:TextBox></td></tr>

                    <tr><td> <b> Password:</b></td>	  		
			  		<td> <asp:TextBox runat="server" id="rgPassword" TabIndex="7" TextMode="Password"></asp:TextBox> </td></tr>
	
                    <tr><td> <b> Confirm password:</b></td>
			  		<td> <asp:TextBox runat="server" id="rgPasswordConfirm" TabIndex="7" TextMode="Password"></asp:TextBox> </td></tr>
		  		
                    <tr><td><b> Affiliation: </b></td>
			  		<td><asp:TextBox runat="server" id="rgAff" TabIndex="8"></asp:TextBox></td></tr>
              
                    <tr><td colspan="2">
                        <div id="footer_right_register">
		     		        <asp:LinkButton runat="server" ID="rgstrButton" onclick="lbRegister_Click" Text="Register"></asp:LinkButton> 
		     		    </div>
                    </td></tr>
                    </table>
					</div>
                    
					
               	
			
            <div><h2><font color='#FFFF00'>
                Or try our <a href="demo">online Demo</a>
            </font></h2></div>
            <div style="text-align:left;padding:20px">
                Interested in the source code? please <a href='http://www.cs.bgu.ac.il/~abedas/'>contact us</a>.
            </div>
            </div>
		</div>
            <asp:Label runat="server" ID="lblhMsg" style="display:none;"></asp:Label>
        </form>
	</div>
   </div>
  </div>

</body>
</html>
