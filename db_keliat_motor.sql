-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 30 Sep 2026 pada 14.39
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_keliat_motor`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `akun`
--

CREATE TABLE `akun` (
  `id_akun` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(20) NOT NULL,
  `role` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `akun`
--

INSERT INTO `akun` (`id_akun`, `username`, `password`, `role`) VALUES
(1, 'admin', '$2b$12$QO73qDWiQ0CCl', 'Admin'),
(2, 'kasir', '$2b$12$F6tC2.GiDMH43', 'Kasir'),
(4, 'admin2', 'admin2', 'Admin');

-- --------------------------------------------------------

--
-- Struktur dari tabel `barang_masuk`
--

CREATE TABLE `barang_masuk` (
  `id_barang_masuk` int(11) NOT NULL,
  `id_suku_cadang` int(11) NOT NULL,
  `qty_masuk` int(11) NOT NULL,
  `harga_beli` decimal(10,2) NOT NULL,
  `tanggal_masuk` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `barang_masuk`
--

INSERT INTO `barang_masuk` (`id_barang_masuk`, `id_suku_cadang`, `qty_masuk`, `harga_beli`, `tanggal_masuk`) VALUES
(1, 1, 5, 70000.00, '2026-06-18 19:06:37'),
(2, 2, 10, 80000.00, '2026-06-18 21:56:04'),
(3, 2, 10, 50000.00, '2026-06-25 10:50:53'),
(4, 3, 5, 20000.00, '2026-07-06 20:37:58'),
(5, 12, 10, 65000.00, '2026-09-06 21:45:25');

-- --------------------------------------------------------

--
-- Struktur dari tabel `detail_transaksi`
--

CREATE TABLE `detail_transaksi` (
  `id_detail` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `id_suku_cadang` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `harga_beli_historis` decimal(10,2) NOT NULL,
  `harga_jual_historis` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `detail_transaksi`
--

INSERT INTO `detail_transaksi` (`id_detail`, `id_transaksi`, `id_suku_cadang`, `qty`, `harga_beli_historis`, `harga_jual_historis`, `subtotal`) VALUES
(1, 1, 1, 1, 70000.00, 75000.00, 75000.00),
(2, 1, 2, 1, 0.00, 90000.00, 90000.00),
(3, 2, 2, 5, 0.00, 90000.00, 450000.00),
(4, 3, 3, 1, 0.00, 45000.00, 45000.00),
(5, 4, 2, 1, 0.00, 90000.00, 90000.00),
(6, 4, 1, 1, 70000.00, 75000.00, 75000.00),
(7, 5, 1, 3, 70000.00, 75000.00, 225000.00),
(8, 6, 2, 13, 80000.00, 90000.00, 1170000.00),
(9, 7, 3, 2, 0.00, 45000.00, 90000.00),
(10, 8, 3, 1, 0.00, 45000.00, 45000.00),
(11, 9, 5, 1, 0.00, 260000.00, 260000.00),
(12, 10, 4, 2, 0.00, 35000.00, 70000.00),
(13, 11, 3, 2, 0.00, 45000.00, 90000.00),
(14, 12, 5, 1, 0.00, 260000.00, 260000.00),
(15, 12, 4, 1, 0.00, 35000.00, 35000.00),
(16, 12, 3, 1, 0.00, 45000.00, 45000.00),
(17, 12, 2, 1, 50000.00, 90000.00, 90000.00),
(18, 13, 11, 1, 0.00, 45000.00, 45000.00),
(19, 13, 10, 3, 0.00, 280000.00, 840000.00),
(20, 14, 9, 1, 0.00, 350000.00, 350000.00),
(21, 15, 11, 1, 0.00, 45000.00, 45000.00),
(22, 15, 7, 1, 0.00, 65000.00, 65000.00),
(23, 16, 3, 1, 20000.00, 45000.00, 45000.00),
(24, 16, 10, 1, 0.00, 280000.00, 280000.00),
(25, 17, 2, 1, 50000.00, 90000.00, 90000.00),
(26, 17, 4, 1, 0.00, 35000.00, 35000.00),
(27, 18, 8, 2, 0.00, 74999.00, 149998.00),
(28, 19, 8, 4, 0.00, 74999.00, 299996.00),
(29, 20, 8, 1, 0.00, 74999.00, 74999.00),
(30, 21, 8, 1, 0.00, 74999.00, 74999.00),
(31, 22, 11, 1, 0.00, 45000.00, 45000.00),
(32, 22, 1, 1, 70000.00, 75000.00, 75000.00),
(33, 23, 3, 1, 20000.00, 45000.00, 45000.00),
(34, 23, 11, 1, 0.00, 45000.00, 45000.00),
(35, 24, 10, 2, 0.00, 280000.00, 560000.00),
(36, 25, 9, 3, 0.00, 350000.00, 1050000.00),
(37, 26, 7, 6, 0.00, 65000.00, 390000.00),
(38, 27, 2, 1, 50000.00, 90000.00, 90000.00),
(39, 28, 11, 1, 0.00, 45000.00, 45000.00),
(40, 28, 2, 1, 50000.00, 90000.00, 90000.00),
(41, 29, 12, 1, 65000.00, 75000.00, 75000.00),
(42, 30, 12, 1, 65000.00, 75000.00, 75000.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `kategori`
--

CREATE TABLE `kategori` (
  `id_kategori` int(11) NOT NULL,
  `nama_kategori` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kategori`
--

INSERT INTO `kategori` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Oli'),
(2, 'Busi'),
(4, 'Ban'),
(5, 'Shockbreaker'),
(6, 'Coolant');

-- --------------------------------------------------------

--
-- Struktur dari tabel `suku_cadang`
--

CREATE TABLE `suku_cadang` (
  `id_suku_cadang` int(11) NOT NULL,
  `kode_item` varchar(100) NOT NULL,
  `id_kategori` int(11) NOT NULL,
  `nama_suku_cadang` varchar(150) NOT NULL,
  `harga_jual` decimal(10,2) NOT NULL,
  `stok` int(11) NOT NULL DEFAULT 0,
  `stok_minimal` int(11) NOT NULL DEFAULT 5,
  `gambar_barang` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `suku_cadang`
--

INSERT INTO `suku_cadang` (`id_suku_cadang`, `kode_item`, `id_kategori`, `nama_suku_cadang`, `harga_jual`, `stok`, `stok_minimal`, `gambar_barang`, `created_at`, `is_deleted`) VALUES
(1, 'BRG8953', 1, 'Oli Yamalube', 75000.00, 19, 10, '1781784109698-656373809.png', '2026-06-18 12:01:49', 0),
(2, 'BRG4649', 1, 'Oli Shell', 90000.00, 6, 5, '1781785176846-644585546.jpg', '2026-06-18 12:19:36', 0),
(3, 'BRG9194', 2, 'NGK Sparkplugs', 45000.00, 21, 20, '1781786934356-334731517.jpg', '2026-06-18 12:48:54', 0),
(4, 'BRG1427', 1, 'Oli Gear Yamaha', 35000.00, 8, 5, '1783327200247-433806588.jpg', '2026-07-06 08:40:00', 0),
(5, 'BRG7602', 4, 'Ban Kingland', 260000.00, 8, 2, '1783327311149-229992829.jpg', '2026-07-06 08:41:51', 0),
(6, 'BRG8699', 5, 'Shockbreaker DBS', 400000.00, 5, 1, '1783352178793-877990694.jpg', '2026-07-06 15:36:18', 0),
(7, 'BRG9351', 1, 'Oli Castrol', 65000.00, 3, 5, '1783352216102-157936093.jpg', '2026-07-06 15:36:56', 0),
(8, 'BRG3536', 6, 'Coolant Honda', 74999.00, 0, 2, '1783352258284-30888416.jpg', '2026-07-06 15:37:29', 0),
(9, 'BRG9787', 4, 'Ban Michellin', 350000.00, 0, 2, '1783352308886-698744370.jpg', '2026-07-06 15:38:28', 1),
(10, 'BRG8310', 4, 'Ban IRC', 280000.00, 2, 2, '1783352334394-138210605.jpg', '2026-07-06 15:38:54', 0),
(11, 'BRG9363', 1, 'Oli Gear AHM', 45000.00, 10, 5, '1783352370324-723348398.jpg', '2026-07-06 15:39:30', 0),
(12, '1-5378', 1, 'Oli Motul', 75000.00, 8, 2, '1788705925658-285639545.jpg', '2026-09-06 14:45:25', 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaksi`
--

CREATE TABLE `transaksi` (
  `id_transaksi` int(11) NOT NULL,
  `no_invoice` varchar(50) NOT NULL,
  `tanggal_transaksi` datetime DEFAULT current_timestamp(),
  `metode_pembayaran` enum('Tunai','QRIS','Transfer') NOT NULL,
  `total_item` int(11) NOT NULL,
  `total_pembayaran` decimal(10,2) NOT NULL,
  `nominal_bayar` decimal(10,2) NOT NULL DEFAULT 0.00,
  `kembalian` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bukti_transaksi` varchar(255) DEFAULT NULL,
  `user` varchar(50) DEFAULT NULL,
  `catatan` text DEFAULT NULL,
  `biaya_jasa` decimal(15,2) DEFAULT 0.00,
  `jenis_transaksi` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `transaksi`
--

INSERT INTO `transaksi` (`id_transaksi`, `no_invoice`, `tanggal_transaksi`, `metode_pembayaran`, `total_item`, `total_pembayaran`, `nominal_bayar`, `kembalian`, `bukti_transaksi`, `user`, `catatan`, `biaya_jasa`, `jenis_transaksi`) VALUES
(1, 'INV-20260618-5707', '2026-06-18 19:23:45', 'Tunai', 2, 165000.00, 200000.00, 35000.00, NULL, NULL, NULL, 0.00, NULL),
(2, 'INV-20260618-7015', '2026-06-18 19:46:05', 'QRIS', 5, 450000.00, 450000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(3, 'INV-20260618-1120', '2026-06-18 20:46:55', 'Transfer', 1, 45000.00, 45000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(4, 'INV-20260618-3733', '2026-06-18 21:04:05', 'Tunai', 2, 165000.00, 200000.00, 35000.00, NULL, NULL, NULL, 0.00, NULL),
(5, 'INV-20260618-2380', '2026-06-18 21:12:39', 'QRIS', 3, 225000.00, 225000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(6, 'INV-20260623-6726', '2026-06-23 18:43:58', 'Transfer', 13, 1170000.00, 1170000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(7, 'INV-20260623-7802', '2026-06-23 22:11:14', 'QRIS', 2, 90000.00, 90000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(8, 'INV-20260625-4084', '2026-06-25 10:53:20', 'Tunai', 1, 45000.00, 50000.00, 5000.00, NULL, NULL, NULL, 0.00, NULL),
(9, 'INV-20260706-8127', '2026-07-06 16:47:11', 'QRIS', 1, 260000.00, 260000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(10, 'INV-20260706-6019', '2026-07-06 16:48:32', 'QRIS', 2, 70000.00, 70000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(11, 'INV-20260706-9394', '2026-07-06 16:49:00', 'Tunai', 2, 90000.00, 90000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(12, 'INV-20260706-6892', '2026-07-06 20:25:48', 'QRIS', 4, 430000.00, 430000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(13, 'INV-20260715-5315', '2026-07-15 08:47:40', 'Tunai', 4, 885000.00, 900000.00, 15000.00, NULL, NULL, NULL, 0.00, NULL),
(14, 'INV-20260715-2915', '2026-07-15 08:48:13', 'QRIS', 1, 350000.00, 350000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(15, 'INV-20260731-4429', '2026-07-31 16:17:13', 'QRIS', 2, 110000.00, 110000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(16, 'INV-20260731-9478', '2026-07-31 17:21:52', 'QRIS', 2, 325000.00, 325000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(17, 'INV-20260831-4759', '2026-08-31 21:55:47', 'QRIS', 2, 125000.00, 125000.00, 0.00, 'bukti-1788188147291-471864043.jpg', NULL, NULL, 0.00, NULL),
(18, 'INV-20260831-9754', '2026-08-31 23:10:28', 'QRIS', 2, 149998.00, 149998.00, 0.00, 'bukti-1788192628612-447330021.jpg', NULL, NULL, 0.00, NULL),
(19, 'INV-20260901-4535', '2026-09-01 09:28:33', 'Tunai', 4, 299996.00, 300000.00, 4.00, NULL, NULL, NULL, 0.00, NULL),
(20, 'INV-20260901-6148', '2026-09-01 09:29:14', 'Tunai', 1, 74999.00, 74999.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(21, 'INV-20260901-4081', '2026-09-01 09:30:36', 'Tunai', 1, 74999.00, 75000.00, 1.00, NULL, NULL, NULL, 0.00, NULL),
(22, 'INV-20260904-3884', '2026-09-04 20:35:24', 'Tunai', 2, 120000.00, 120000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(23, 'INV-20260904-5694', '2026-09-04 20:36:27', 'Tunai', 2, 90000.00, 90000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(24, 'INV-20260904-6680', '2026-09-04 22:02:21', 'Tunai', 2, 560000.00, 560000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(25, 'INV-20260904-5320', '2026-09-04 22:56:28', 'Tunai', 3, 1050000.00, 1050000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(26, 'INV-20260904-9709', '2026-09-04 22:57:28', 'Tunai', 6, 390000.00, 390000.00, 0.00, NULL, NULL, NULL, 0.00, NULL),
(27, 'INV-20260906-6956', '2026-09-06 18:53:10', 'Tunai', 1, 95000.00, 100000.00, 5000.00, NULL, 'admin', 'ganti oli', 5000.00, NULL),
(28, 'INV-20260906-8913', '2026-09-06 18:55:58', 'Tunai', 2, 140000.00, 150000.00, 10000.00, NULL, 'kasir', 'ganti oli', 5000.00, NULL),
(29, 'INV-20260914-4565', '2026-09-14 17:55:00', 'Tunai', 1, 100000.00, 100000.00, 0.00, NULL, 'kasir', NULL, 25000.00, 'sparepart only'),
(30, 'INV-20260921-5769', '2026-09-21 22:43:56', 'Tunai', 1, 80000.00, 100000.00, 20000.00, NULL, 'kasir2', 'ganti oli', 5000.00, 'jasa only');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `akun`
--
ALTER TABLE `akun`
  ADD PRIMARY KEY (`id_akun`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indeks untuk tabel `barang_masuk`
--
ALTER TABLE `barang_masuk`
  ADD PRIMARY KEY (`id_barang_masuk`),
  ADD KEY `id_suku_cadang` (`id_suku_cadang`);

--
-- Indeks untuk tabel `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `id_transaksi` (`id_transaksi`),
  ADD KEY `id_suku_cadang` (`id_suku_cadang`);

--
-- Indeks untuk tabel `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id_kategori`);

--
-- Indeks untuk tabel `suku_cadang`
--
ALTER TABLE `suku_cadang`
  ADD PRIMARY KEY (`id_suku_cadang`),
  ADD UNIQUE KEY `kode_item` (`kode_item`),
  ADD KEY `id_kategori` (`id_kategori`);

--
-- Indeks untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id_transaksi`),
  ADD UNIQUE KEY `no_invoice` (`no_invoice`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `akun`
--
ALTER TABLE `akun`
  MODIFY `id_akun` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `barang_masuk`
--
ALTER TABLE `barang_masuk`
  MODIFY `id_barang_masuk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT untuk tabel `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id_kategori` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `suku_cadang`
--
ALTER TABLE `suku_cadang`
  MODIFY `id_suku_cadang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id_transaksi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `barang_masuk`
--
ALTER TABLE `barang_masuk`
  ADD CONSTRAINT `barang_masuk_ibfk_1` FOREIGN KEY (`id_suku_cadang`) REFERENCES `suku_cadang` (`id_suku_cadang`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD CONSTRAINT `detail_transaksi_ibfk_1` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE,
  ADD CONSTRAINT `detail_transaksi_ibfk_2` FOREIGN KEY (`id_suku_cadang`) REFERENCES `suku_cadang` (`id_suku_cadang`);

--
-- Ketidakleluasaan untuk tabel `suku_cadang`
--
ALTER TABLE `suku_cadang`
  ADD CONSTRAINT `suku_cadang_ibfk_1` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
