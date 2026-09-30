# Keliat Motor POS - System Diagrams

## 1. Use Case Diagram

Diagram Use Case ini menggambarkan interaksi antara dua tipe pengguna (Admin dan Kasir) dengan sistem Point of Sale.

```mermaid
usecaseDiagram
    actor Admin
    actor Kasir
    
    rectangle "Keliat Motor POS System" {
        usecase "Login ke Sistem" as UC1
        
        usecase "Mengelola Barang (CRUD)" as UC2
        usecase "Mencatat Barang Masuk" as UC3
        usecase "Melihat Stok Barang" as UC4
        
        usecase "Memproses Transaksi Kasir" as UC5
        usecase "Mencetak Struk Otomatis/Manual" as UC6
        usecase "Melihat Riwayat Transaksi" as UC7
        
        usecase "Melihat Laporan (Dashboard)" as UC8
        usecase "Mengelola Akun Karyawan" as UC9
    }
    
    %% Hubungan Admin
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    
    %% Hubungan Kasir
    Kasir --> UC1
    Kasir --> UC4
    Kasir --> UC5
    Kasir --> UC6
    Kasir --> UC7
    
    %% Hubungan dependensi antar Use Case
    UC5 ..> UC6 : <<include>>
    UC2 ..> UC6 : <<include>> (Cetak Label)
```

## 2. Class Diagram

Class Diagram ini merepresentasikan struktur data dari tabel-tabel di database `db_keliat_motor` yang digunakan oleh backend.

```mermaid
classDiagram
    class Akun {
        +int id_akun
        +String username
        +String password
        +String role
        +login()
        +logout()
    }
    
    class SukuCadang {
        +int id_suku_cadang
        +String kode_item
        +String nama_suku_cadang
        +String tipe
        +int jumlah_stok
        +String gambar_barang
        +float harga_modal
        +float harga_jual
        +int batas_stok_minimum
        +tambahStok()
        +kurangiStok()
    }
    
    class BarangMasuk {
        +int id_barang_masuk
        +int id_suku_cadang
        +int jumlah_masuk
        +float harga_modal_saat_ini
        +String nama_supplier
        +String tanggal_masuk
    }
    
    class Transaksi {
        +int id_transaksi
        +String no_invoice
        +String tanggal_transaksi
        +int total_item
        +float total_pembayaran
        +float nominal_bayar
        +float kembalian
        +String metode_pembayaran
    }
    
    class DetailTransaksi {
        +int id_detail
        +int id_transaksi
        +int id_suku_cadang
        +int qty
        +float harga_jual
        +float subtotal
    }
    
    SukuCadang "1" -- "0..*" BarangMasuk : Memiliki >
    Transaksi "1" *-- "1..*" DetailTransaksi : Terdiri dari >
    SukuCadang "1" -- "0..*" DetailTransaksi : Terdapat pada >
```
