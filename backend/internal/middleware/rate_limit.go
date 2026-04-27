package middleware

import (
	"context"
	"net/http"

	"backend/internal/config"

	"github.com/gin-gonic/gin"
)

func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		apiKeyIDRaw, exists := c.Get("apiKeyID")
		userPlanRaw, planExists := c.Get("userPlan")

		if !exists || !planExists {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "ข้อมูล API Key ขาดหาย"})
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

		// 3. นับจำนวนการใช้งานใน "1 นาทีที่ผ่านมา" จาก Database
		var count int
		query := `
			SELECT COUNT(*) 
			FROM usage_logs 
			WHERE api_key_id = $1 AND accessed_at >= NOW() - INTERVAL '1 minute'
		`
		
		err := config.DB.QueryRow(context.Background(), query, apiKeyID).Scan(&count)
		if err != nil {
			// ถ้า Query พัง ให้ถือว่าเพิ่งใช้งาน 0 ครั้งไปก่อน เพื่อไม่ให้ระบบล่ม
			count = 0 
		}

		// 4. ถ้าใช้เกินโควต้า! เตะกลับ 429
		if count >= limit {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Rate limit exceeded. โควต้าของคุณเต็มแล้ว กรุณารอ 1 นาที",
				"plan":    userPlan,
				"limit":   limit,
			})
			return
		}

		// 5. ถ้ายังไม่เกิน ให้บันทึกประวัติการใช้งาน
		insertQuery := `INSERT INTO usage_logs (api_key_id, endpoint) VALUES ($1, $2)`
		_, err = config.DB.Exec(context.Background(), insertQuery, apiKeyID, c.Request.URL.Path)
		if err != nil {
			// แจ้งเตือนใน Terminal ถ้าบันทึกลง Log ไม่สำเร็จ แต่ยังให้ User ใช้งานผ่านไปได้
			// log.Println("⚠️ ไม่สามารถบันทึก Log ได้:", err)
		}

		// ปล่อยผ่านไปหา Controller ดึงข้อมูลหนัง
		c.Next()
	}
}