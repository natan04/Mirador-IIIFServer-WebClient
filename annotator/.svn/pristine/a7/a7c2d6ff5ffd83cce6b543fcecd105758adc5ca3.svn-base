using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebGTModel
{

    /// <summary>
    /// Summary description for Manuscript
    /// </summary>
    public partial class Manuscript
    {
        public IQueryable<ManuscriptPage> ManuscriptActivePages
        {
            get
            {
                return Utils.Model.ManuscriptPages.Where(mp => mp.ManuscriptID == ID && !mp.IsDeleted);
            }

        }
    }
}