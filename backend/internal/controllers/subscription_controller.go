package controllers

import (
	"context"
	"net/http"
	"backend/internal/config"

	"github.com/gin-gonic/gin"
)

// สร้างโครงสร้างเพื่อรับค่า Plan จาก Postman
type UpgradeInput struct {
	Plan string `json:"plan" binding:"required"` // รับค่า free, medium, หรือ premium
}

// POST /api/subscription/upgrade
func UpgradeSubscription(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var input UpgradeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุแพ็กเกจที่ต้องการ (free, medium, premium)"})
		return
	}

	// ตรวจสอบความถูกต้องของชื่อ Plan (ป้องกันคนส่งชื่อมั่วๆ มา)
	validPlans := map[string]bool{"free": true, "medium": true, "premium": true}
	if !validPlans[input.Plan] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ชื่อแพ็กเกจไม่ถูกต้อง กรุณาใช้ free, medium หรือ premium"})
		return
	}

	// อัปเดต Plan ในตาราง users
	query := `UPDATE users SET plan = $1 WHERE id = $2 RETURNING plan`
	
	var newPlan string
	err := config.DB.QueryRow(context.Background(), query, input.Plan, userID).Scan(&newPlan)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถเปลี่ยนแพ็กเกจได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "เปลี่ยนแพ็กเกจสำเร็จแล้ว!",
		"current_plan": newPlan,
	})
}