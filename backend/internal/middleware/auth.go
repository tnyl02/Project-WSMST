package middleware

import (
	"context"
	"net/http"

	"backend/internal/config"
	"github.com/gin-gonic/gin"
)

func APIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("x-api-key")
		if apiKey == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "กรุณาแนบ API Key"})
			return
		}

		var apiKeyID uint
		var userPlan string

		// 🎯 ใช้ SQL แท้ๆ (JOIN ตาราง api_keys กับ users เข้าด้วยกัน)
		query := `
			SELECT a.id, u.plan
			FROM api_keys a
			JOIN users u ON a.user_id = u.id
			WHERE a.key_string = $1 AND a.is_active = true
		`
		
		// สั่งรัน Query และเอาผลลัพธ์มาใส่ตัวแปร
		err := config.DB.QueryRow(context.Background(), query, apiKey).Scan(&apiKeyID, &userPlan)

		// ถ้า Query พัง หรือ หา Key ไม่เจอ
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "API Key ไม่ถูกต้อง หรือถูกระงับ"})
			return
		}

		// 🎉 ฝากข้อมูลใส่ Context ไปให้ Rate Limit
		c.Set("apiKeyID", apiKeyID)
		c.Set("userPlan", userPlan)

		c.Next()
	}
}