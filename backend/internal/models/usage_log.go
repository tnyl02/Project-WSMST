package models

import "time"

type UsageLog struct {
	ID         uint      `gorm:"primaryKey;column:id"`
	APIKeyID   uint      `gorm:"column:api_key_id"`
	Endpoint   string    `gorm:"column:endpoint"`
	AccessedAt time.Time `gorm:"column:accessed_at;autoCreateTime"` // ให้บันทึกเวลาปัจจุบันอัตโนมัติ
}