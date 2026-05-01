package controllers

import (
	"context"
	"fmt"
	"net/http"
	"time"
	"backend/internal/config"

	"github.com/gin-gonic/gin"
)

func GetDashboardStats(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var todayUsage int
	queryUsage := `
		SELECT COUNT(*) 
		FROM usage_logs ul
		JOIN api_keys ak ON ul.api_key_id = ak.id
		WHERE ak.user_id = $1 AND DATE(ul.accessed_at) = CURRENT_DATE`
	config.DB.QueryRow(context.Background(), queryUsage, userID).Scan(&todayUsage)

	var todayErrors int
	queryErrors := `
		SELECT COUNT(*) 
		FROM usage_logs ul
		JOIN api_keys ak ON ul.api_key_id = ak.id
		WHERE ak.user_id = $1 AND DATE(ul.accessed_at) = CURRENT_DATE AND ul.status_code = 429`
	config.DB.QueryRow(context.Background(), queryErrors, userID).Scan(&todayErrors)

	var monthlyUsage int
	queryMonthly := `
		SELECT COUNT(*) 
		FROM usage_logs ul
		JOIN api_keys ak ON ul.api_key_id = ak.id
		WHERE ak.user_id = $1 AND date_trunc('month', ul.accessed_at) = date_trunc('month', CURRENT_DATE)`
	config.DB.QueryRow(context.Background(), queryMonthly, userID).Scan(&monthlyUsage)

	var minuteUsage int
	queryMinute := `
		SELECT COUNT(*) 
		FROM usage_logs ul
		JOIN api_keys ak ON ul.api_key_id = ak.id
		WHERE ak.user_id = $1 AND ul.accessed_at >= NOW() - INTERVAL '1 minute'`
	config.DB.QueryRow(context.Background(), queryMinute, userID).Scan(&minuteUsage)

	queryGraph := `
		SELECT DATE(ul.accessed_at) as date, COUNT(*) as count 
		FROM usage_logs ul
		JOIN api_keys ak ON ul.api_key_id = ak.id
		WHERE ak.user_id = $1 AND ul.accessed_at >= CURRENT_DATE - INTERVAL '7 days'
		GROUP BY DATE(ul.accessed_at)
		ORDER BY DATE(ul.accessed_at) ASC
	`
	rows, err := config.DB.Query(context.Background(), queryGraph, userID)
	if err != nil {
		fmt.Println("SQL Error (Graph):", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database ฟ้องว่า: " + err.Error()})
		return
	}
	defer rows.Close()

	var graphData []map[string]interface{}
	for rows.Next() {
		var date time.Time
		var count int
		if err := rows.Scan(&date, &count); err == nil {
			graphData = append(graphData, map[string]interface{}{
				"date":  date.Format("2006-01-02"),
				"count": count,
			})
		}
	}

	if graphData == nil {
		graphData = []map[string]interface{}{}
	}

	
	c.JSON(http.StatusOK, gin.H{
		"today_usage":   todayUsage,
		"today_errors":  todayErrors,
		"monthly_usage": monthlyUsage,
		"minute_usage":  minuteUsage,  
		"graph_data":    graphData,
	})
}

func GetUsageLogs(c *gin.Context) {
	userID, _ := c.Get("user_id")

	query := `
		SELECT ul.accessed_at, ul.endpoint, ul.status_code 
		FROM usage_logs ul
		JOIN api_keys ak ON ul.api_key_id = ak.id
		WHERE ak.user_id = $1 
		ORDER BY ul.accessed_at DESC 
		LIMIT 50
	`
	rows, err := config.DB.Query(context.Background(), query, userID)
	if err != nil {
		fmt.Println("SQL Error (Logs):", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database ฟ้องว่า: " + err.Error()})
		return
	}
	defer rows.Close()

	var logs []map[string]interface{}
	for rows.Next() {
		var accessedAt time.Time
		var endpoint string
		var nullableStatusCode *int 

		if err := rows.Scan(&accessedAt, &endpoint, &nullableStatusCode); err == nil {
			statusCode := 200
			if nullableStatusCode != nil {
				statusCode = *nullableStatusCode
			}

			logs = append(logs, map[string]interface{}{
				"time":        accessedAt.Format("2006-01-02 15:04:05"),
				"endpoint":    endpoint,
				"status_code": statusCode,
			})
		}
	}

	if logs == nil {
		logs = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, gin.H{
		"logs": logs,
	})
}