import mysql from 'mysql2/promise'

export const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // pakai password XAMPP kamu kalau ada
  database: 'db_sifasbi',
}

export const getConnection = () => mysql.createConnection(dbConfig)
