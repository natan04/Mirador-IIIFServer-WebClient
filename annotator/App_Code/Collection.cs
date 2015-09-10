using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebGTModel
{

    /// <summary>
    /// Summary description for Collection
    /// </summary>
    public partial class Collection
    {
        public bool IsManager
        {
            get {
                User mngr = Users.SingleOrDefault(u => u.ID == Utils.CurrentUser.ID);
                return mngr != null;
                //return Users.Contains<User>(Utils.CurrentUser);
            }
        }

        public List<Manuscript> UserManuscripts{get;set;}

        public TaggingScheme Scheme
        {
            get { return TaggingScheme.GetScheme(TaggingSchemeID); }
        }
        //public DocElement[] ElementTypes
        //{
        //    get
        //    {
        //        return ElementTypes.ToArray();
        //    }
        //}

        public bool AddUser(User u)
        {
            Users.Add(u);
            return true;
        }


        internal bool PrepareByUserPermissions(User u)
        {
            bool includeCollectionForUser = false;
            UserManuscripts = new List<Manuscript>();

            if (IsManager)
            {
                UserManuscripts = Manuscripts.ToList();
                return true;
            }
            else
            {
                foreach (Manuscript ms in Manuscripts)
                {
                    var mspages = ms.ManuscriptPages.Where(p => p.AssignedToID == u.ID);
                    if (mspages.Count() > 0)
                    {
                        UserManuscripts.Add(ms);
                        includeCollectionForUser = true;
                    }
                }
            }

            return includeCollectionForUser;
            
        }
    }
}