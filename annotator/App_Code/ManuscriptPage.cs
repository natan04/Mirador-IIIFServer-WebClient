using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebGTModel
{

    /// <summary>
    /// Summary description for ManuscriptPage
    /// </summary>
    public partial class ManuscriptPage
    {
        public object AssignedToUser
        {
            get
            {
                if (AssignedTo == null)
                    return null;
                else
                    return new { ID = AssignedToID, Name = AssignedTo.FirstName + " " + AssignedTo.LastName };
            }
        }

        public bool LastUserDocument
        {
            get
            {
                return Utils.CurrentUser.LastDocID == ID;
            }
        }

        public List<DocElement> GetDocElements()// in order to overcome the automatic sirialization of public properties
        {
            return this.DocElements.ToList();
        }

        
    }
}