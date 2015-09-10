﻿ALTER TABLE dbo.ManuscriptPages ADD
	ReductionRatio decimal(18, 0) NULL

ALTER TABLE dbo.Users ADD
	LastDocID int NULL

ALTER TABLE dbo.ManuscriptPages ADD
	IsDeleted bit NOT NULL CONSTRAINT DF_ManuscriptPages_IsDeleted DEFAULT 0

-- 19/2/12 - ofer

ALTER TABLE dbo.Collections ADD
	TaggingSchemeID tinyint NOT NULL CONSTRAINT DF_Collections_TaggingSchemeID DEFAULT 1;
ALTER TABLE dbo.Collections
	DROP CONSTRAINT DF_Collections_BaseDocElementTypeID;
ALTER TABLE dbo.Collections
	DROP COLUMN BaseDocElementTypeID;
