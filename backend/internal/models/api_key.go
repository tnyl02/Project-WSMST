package models

type APIKey struct {
	ID        uint   `gorm:"primaryKey;column:id"`
	UserID    uint   `gorm:"column:user_id"`
	User      User   `gorm:"foreignKey:UserID"` // 🎯 เชื่อมความสัมพันธ์ไปหาตาราง User
	KeyString string `gorm:"column:key_string"`
	IsActive  bool   `gorm:"column:is_active"`
}