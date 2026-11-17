---
title: Performance Tuning in Azure SQL Data Warehouse
date: '2017-03-14'
updated: '2026-11-17'
permalink: /performance-tuning-in-azure-sql-data-warehouse/
author: Randy Walker
categories:
  - data
  - development
meta_title: Performance Tuning Azure SQL Data Warehouse and Synapse SQL
meta_description: "Tune Azure SQL Data Warehouse (now Synapse dedicated SQL pools): build statistics, read EXPLAIN plans for data movement, check skew, and trace slow query steps."
tags:
  - azure
  - sql-data-warehouse
  - synapse
  - performance-tuning
  - sql
post_image: /assets/images/blog/performance-tuning-in-azure-sql-data-warehouse.webp
---

*Update, November 2026: Azure SQL Data Warehouse is now dedicated SQL pools in [Azure Synapse Analytics](https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/sql-data-warehouse-overview-what-is). The statistics, `EXPLAIN`, skew and DMV techniques below still apply there. Newer pools create single-column statistics automatically, so the script below matters most on older pools and for [multi-column statistics on your join columns](https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/sql-data-warehouse-tables-statistics).*

(This was originally posted on 01/09/2016 on another site and has been moved here) 

Yesterday I spent over an hour with John Huang ([Azure SQL Data Warehouse](https://azure.microsoft.com/en-us/services/sql-data-warehouse/) team) and Martin Lee (MCS – Microsoft Consulting Services).  They were extremely graceful in helping me try to performance tune a very difficult query.  Since [SQLDW](https://azure.microsoft.com/en-us/services/sql-data-warehouse/) is so new, they are looking to see how to help the community as a whole in how to tune performance. 

So there are two different ways to tune

1.  Tune the table
2.  Tune the query

First we need to tune the table regardless.  This code will write statements that create statistics on all tables.  (Credit of this code goes to John Huang)  If you’d like to only specify one table, then uncomment the commented line and put in the table name in single quotes.  Don’t forget to execute the resulting text.

<pre>-- This will create stat for all columns on all objects  SELECT 'CREATE STATISTICS [' + sys.tables.name + '_' + sys.columns.name + '_stat] ON dbo.[' + sys.tables.name + '] ([' + sys.columns.name + ']);' AS '--CREATE STATS'
FROM sys.tables, sys.columns
WHERE sys.tables.object_id = sys.columns.object_id
	AND NOT EXISTS (
		SELECT NULL  FROM sys.stats_columns  WHERE object_id IN (
			SELECT object_id  FROM sys.stats_columns  GROUP BY object_id  HAVING Count(*) = 1)
		AND object_id = sys.columns.object_id
	AND column_id = sys.columns.column_id)
--AND sys.tables.name =  ORDER BY sys.tables.name,
sys.columns.column_id;</pre>

This is an extremely important step.  Without it, your query will not run efficiently.  One adjustment to the statistics is to create them on columns where you would typically join other tables.  By no means am I a DBA, so you’ll likely need more information from those more qualified on the best methods on statistic creation. 

You next want to look at the execution plan for your query

<pre>EXPLAIN
SELECT *
FROM myTable</pre>

This will give you an xml document.  Bad things we noticed were things like “BROADCAST_MOVE” which means it’s doing data movement.  Data movement = bad.  Data skew is also bad. 

I highly recommend Microsoft’s guide to [monitoring workloads using DMVs](https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/sql-data-warehouse-manage-monitor). 

To make things a little more simple, the first thing I would do is the last item on the list.  Take a look at the skew.

<pre>-- Find data skew for a distributed table
DBCC PDW_SHOWSPACEUSED("dbo.FactInternetSales");</pre>

Make sure that it’s as even as possible.  The next thing is run the query.  While it’s running you need to find the request id of the query you’re running.

<pre>SELECT * FROM sys.dm_pdw_exec_requests WHERE status = 'Running';</pre>

Then start watching the execution steps that it’s going through.

<pre>SELECT DATEDIFF(SECOND, start_time, end_time) Time_In_Seconds, * FROM sys.dm_pdw_request_steps
WHERE request_id = 'QID247206'  --change this to the request id from the previous query
ORDER BY step_index;</pre>

In the first column, you’ll see how much time the query is taking in seconds.  You can look at the other fields for more details. 

For now this is all I have but I’ll try to follow up with some actual ways to help tune in the future.  Again a huge thanks to the [SQLDW](https://azure.microsoft.com/en-us/services/sql-data-warehouse/) team for helping out.

Nearly a decade later I’m still building on Azure. [Thirteen deployments in one day](/13-deployments-one-day-azure-migration/) is the more recent chapter.
