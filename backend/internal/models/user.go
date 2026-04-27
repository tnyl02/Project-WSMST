package models

type User struct {
	ID           uint   `gorm:"primaryKey;column:id"`
	Username     string `gorm:"column:username"`
	Email        string `gorm:"column:email"`
	PasswordHash string `gorm:"column:password_hash"`
	Plan         string `gorm:"column:plan"`
}