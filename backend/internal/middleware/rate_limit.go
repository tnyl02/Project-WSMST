package middleware

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"backend/internal/config"

	"github.com/gin-gonic/gin"
)

func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKeyIDRaw, exists := c.Get("apiKeyID")
		userPlanRaw, planExists := c.Get("userPlan")

		if !exists || !planExists {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"message": "ข้อมูล API Key ขาดหาย",
			})
			return
		}

		apiKeyID := apiKeyIDRaw.(uint)
		userPlan := userPlanRaw.(string)

		var limit int
		switch userPlan {
		case "premium":
			limit = 100
		case "medium":
			limit = 50
		default:
			limit = 10
		}

		var count int
		var oldestAccessedAt *time.Time
		query := `
			SELECT COUNT(*), MIN(accessed_at)
			FROM usage_logs
			WHERE api_key_id = $1 AND accessed_at >= NOW() - INTERVAL '1 minute'
		`

		err := config.DB.QueryRow(context.Background(), query, apiKeyID).Scan(&count, &oldestAccessedAt)
		if err != nil {
			count = 0
			oldestAccessedAt = nil
		}

		if count >= limit {
			resetAt := time.Now().Add(time.Minute)
			if oldestAccessedAt != nil {
				resetAt = oldestAccessedAt.Add(time.Minute)
			}

			retryAfter := int(time.Until(resetAt).Seconds())
			if retryAfter < 0 {
				retryAfter = 0
			}


			insertErrorQuery := `INSERT INTO usage_logs (api_key_id, endpoint, status_code) VALUES ($1, $2, 429)`
			config.DB.Exec(context.Background(), insertErrorQuery, apiKeyID, c.Request.URL.Path)

			c.Header("Retry-After", strconv.Itoa(retryAfter))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"success":             false,
				"message":             "Rate limit exceeded. โควต้าของคุณเต็มแล้ว กรุณารอ 1 นาที",
				"plan":                userPlan,
				"limit":               limit,
				"reset_at":            resetAt.UTC().Format(time.RFC3339),
				"retry_after_seconds": retryAfter,
			})
			return
		}

		if c.GetHeader("x-internal-client") == "true" {
			c.Next()
			return
		}

		insertQuery := `INSERT INTO usage_logs (api_key_id, endpoint, status_code) VALUES ($1, $2, 200)`
		_, err = config.DB.Exec(context.Background(), insertQuery, apiKeyID, c.Request.URL.Path)
		if err != nil {
			// Ignore logging failures so API traffic can continue.
		}

		c.Next()
	}
}