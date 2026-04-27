package controllers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
	"time"
	"backend/internal/config"

	"github.com/gin-gonic/gin"
)

func GetKeyDetails(c *gin.Context) {
	userID, _ := c.Get("user_id") 

	var keyString string
	query := `SELECT key_string FROM api_keys WHERE user_id = $1`
	err := config.DB.QueryRow(context.Background(), query, userID).Scan(&keyString)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบ API Key สำหรับผู้ใช้นี้"})
		return
	}

	status := "Active"
	if keyString == "REVOKED" {
		status = "Revoked (ถูกระงับ)"
	}

	prefix := "N/A"
	if strings.HasPrefix(keyString, "mov_") {
		parts := strings.Split(keyString, "_")
		if len(parts) >= 2 {
			prefix = parts[0] + "_" + parts[1]
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"api_key":      keyString,
		"prefix":       prefix,
		"status":       status,
		"retrieved_at": time.Now().Format("2006-01-02 15:04:05"), 
	})
}

func RegenerateKey(c *gin.Context) {
	userID, _ := c.Get("user_id") 

	bytes := make([]byte, 16)
	rand.Read(bytes)
	newAPIKey := "mov_re_gen_" + hex.EncodeToString(bytes)

	query := `UPDATE api_keys SET key_string = $1 WHERE user_id = $2 RETURNING key_string`
	var updatedKey string
	err := config.DB.QueryRow(context.Background(), query, newAPIKey, userID).Scan(&updatedKey)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดต API Key ได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "สร้าง API Key ใหม่สำเร็จ",
		"new_key": updatedKey,
	})
}

func RevokeKey(c *gin.Context) {
	userID, _ := c.Get("user_id")

	query := `UPDATE api_keys SET key_string = 'REVOKED' WHERE user_id = $1`
	_, err := config.DB.Exec(context.Background(), query, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถระงับ API Key ได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ระงับการใช้งาน API Key สำเร็จ",
		"status":  "Revoked",
	})
}