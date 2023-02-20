-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 10-02-2023 a las 13:36:52
-- Versión del servidor: 10.5.16-MariaDB-cll-lve
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u970133903_BGMDB`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Clientes`
--

CREATE TABLE `Clientes` (
  `CTE` varchar(255) DEFAULT NULL,
  `FICHA` varchar(255) DEFAULT NULL,
  `APELLIDO Y NOMBRE` varchar(255) DEFAULT NULL,
  `ZONA` varchar(255) DEFAULT NULL,
  `CALLE` varchar(255) DEFAULT NULL,
  `CRUCES` varchar(255) DEFAULT NULL,
  `CRUCES2` varchar(255) DEFAULT NULL,
  `WHATS APP` varchar(255) DEFAULT NULL,
  `DNI` varchar(255) DEFAULT NULL,
  `Master` varchar(255) DEFAULT NULL,
  `OBS` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Cobranzas`
--

CREATE TABLE `Cobranzas` (
  `FECHA` varchar(255) DEFAULT NULL,
  `CTE` varchar(255) DEFAULT NULL,
  `Ficha` varchar(255) DEFAULT NULL,
  `Z` varchar(255) DEFAULT NULL,
  `VTA` varchar(255) DEFAULT NULL,
  `Anterior` varchar(255) DEFAULT NULL,
  `Mes 0` varchar(255) DEFAULT NULL,
  `Mes 1` varchar(255) DEFAULT NULL,
  `Mes 2` varchar(255) DEFAULT NULL,
  `Mes 3` varchar(255) DEFAULT NULL,
  `Mes 4` varchar(255) DEFAULT NULL,
  `Mes 5` varchar(255) DEFAULT NULL,
  `Sal Ant` varchar(255) DEFAULT NULL,
  `Mes 6` varchar(255) DEFAULT NULL,
  `Sal Act` varchar(255) DEFAULT NULL,
  `Cuota` varchar(255) DEFAULT NULL,
  `V` varchar(255) DEFAULT NULL,
  `Estado` varchar(255) DEFAULT NULL,
  `VEN` varchar(255) DEFAULT NULL,
  `VenMovil` varchar(255) DEFAULT NULL,
  `cob` varchar(255) DEFAULT NULL,
  `Cuota original` varchar(255) DEFAULT NULL,
  `-` varchar(255) DEFAULT NULL,
  `MoraAnt` varchar(255) DEFAULT NULL,
  `MoraPaga` varchar(255) DEFAULT NULL,
  `Mora` varchar(255) DEFAULT NULL,
  `ServAnt` varchar(255) DEFAULT NULL,
  `ServPaga` varchar(255) DEFAULT NULL,
  `Serv` varchar(255) DEFAULT NULL,
  `Por cobrar` varchar(255) DEFAULT NULL,
  `Vencidas` varchar(255) DEFAULT NULL,
  `Cuotas Pagas` varchar(255) DEFAULT NULL,
  `Atraso` varchar(255) DEFAULT NULL,
  `Totales` varchar(255) DEFAULT NULL,
  `Valor Unitario` varchar(255) DEFAULT NULL,
  `Cobrar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `CobranzasEC`
--

CREATE TABLE `CobranzasEC` (
  `FECHA` varchar(255) DEFAULT NULL,
  `CTE` varchar(255) DEFAULT NULL,
  `Prestamo` varchar(255) DEFAULT NULL,
  `Zona` varchar(255) DEFAULT NULL,
  `Valor` varchar(255) DEFAULT NULL,
  `Capital` varchar(255) DEFAULT NULL,
  `Ant` varchar(255) DEFAULT NULL,
  `AGO` varchar(255) DEFAULT NULL,
  `SEP` varchar(255) DEFAULT NULL,
  `OCT` varchar(255) DEFAULT NULL,
  `NOV` varchar(255) DEFAULT NULL,
  `DIC` varchar(255) DEFAULT NULL,
  `ENE` varchar(255) DEFAULT NULL,
  `Saldo Ant` varchar(255) DEFAULT NULL,
  `FEB` varchar(255) DEFAULT NULL,
  `Saldo Act` varchar(255) DEFAULT NULL,
  `Cuota` varchar(255) DEFAULT NULL,
  `Cuo` varchar(255) DEFAULT NULL,
  `Estatus` varchar(255) DEFAULT NULL,
  `V` varchar(255) DEFAULT NULL,
  `Fecha cobro` varchar(255) DEFAULT NULL,
  `C De Fecha` varchar(255) DEFAULT NULL,
  `Prox Fecha` varchar(255) DEFAULT NULL,
  `SERVICIOS ANT` varchar(255) DEFAULT NULL,
  `SERVICIOS PAGO` varchar(255) DEFAULT NULL,
  `SERVICIOS` varchar(255) DEFAULT NULL,
  `MORA ANT` varchar(255) DEFAULT NULL,
  `MORA PAGA` varchar(255) DEFAULT NULL,
  `MORA` varchar(255) DEFAULT NULL,
  `MORA UNIT` varchar(255) DEFAULT NULL,
  `Vencidas` varchar(255) DEFAULT NULL,
  `Deuda Cuo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `MasterResumen`
--

CREATE TABLE `MasterResumen` (
  `Cliente` varchar(255) DEFAULT NULL,
  `Frecuencia` varchar(255) DEFAULT NULL,
  `Primer Compra` varchar(255) DEFAULT NULL,
  `Ultima Compra` varchar(255) DEFAULT NULL,
  `VUProm` varchar(255) DEFAULT NULL,
  `CuotasProm` varchar(255) DEFAULT NULL,
  `VUMin` varchar(255) DEFAULT NULL,
  `CuotasMin` varchar(255) DEFAULT NULL,
  `VUMax` varchar(255) DEFAULT NULL,
  `CuotasMax` varchar(255) DEFAULT NULL,
  `CLAVOS` varchar(255) DEFAULT NULL,
  `Paga Muy Bien` varchar(255) DEFAULT NULL,
  `Paga Bien` varchar(255) DEFAULT NULL,
  `Paga Mal` varchar(255) DEFAULT NULL,
  `CALIF` varchar(255) DEFAULT NULL,
  `Lcompra` varchar(255) DEFAULT NULL,
  `Cobranza` varchar(255) DEFAULT NULL,
  `Ventas` varchar(255) DEFAULT NULL,
  `Tomado` varchar(255) DEFAULT NULL,
  `Disponible` varchar(255) DEFAULT NULL,
  `2022` varchar(255) DEFAULT NULL,
  `2021` varchar(255) DEFAULT NULL,
  `2020` varchar(255) DEFAULT NULL,
  `2019` varchar(255) DEFAULT NULL,
  `CANT` varchar(255) DEFAULT NULL,
  `Atrasos` varchar(255) DEFAULT NULL,
  `Mora Easy` varchar(255) DEFAULT NULL,
  `DATOS` varchar(255) DEFAULT NULL,
  `BGM DISPONIBLE` varchar(255) DEFAULT NULL,
  `Frec` varchar(255) DEFAULT NULL,
  `CONT` varchar(255) DEFAULT NULL,
  `SALDO` varchar(255) DEFAULT NULL,
  `CAPITAL` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Ventas`
--

CREATE TABLE `Ventas` (
  `Fecha` varchar(255) DEFAULT NULL,
  `CTE` varchar(255) DEFAULT NULL,
  `Ficha` varchar(255) DEFAULT NULL,
  `Zona` varchar(255) DEFAULT NULL,
  `Total` varchar(255) DEFAULT NULL,
  `Cobrado` varchar(255) DEFAULT NULL,
  `Saldo` varchar(255) DEFAULT NULL,
  `Cuota` varchar(255) DEFAULT NULL,
  `V` varchar(255) DEFAULT NULL,
  `Ret` varchar(255) DEFAULT NULL,
  `Condicion` varchar(255) DEFAULT NULL,
  `Tipo` varchar(255) DEFAULT NULL,
  `Estatus` varchar(255) DEFAULT NULL,
  `Fecha cobro` varchar(255) DEFAULT NULL,
  `Vendedor` varchar(255) DEFAULT NULL,
  `ServPaga` varchar(255) DEFAULT NULL,
  `Serv` varchar(255) DEFAULT NULL,
  `Por cobrar` varchar(255) DEFAULT NULL,
  `Vencidas` varchar(255) DEFAULT NULL,
  `Cuotas Pagas` varchar(255) DEFAULT NULL,
  `Atraso` varchar(255) DEFAULT NULL,
  `Dia` varchar(255) DEFAULT NULL,
  `Valor Unitario` varchar(255) DEFAULT NULL,
  `Cuotas` varchar(255) DEFAULT NULL,
  `Cobrar` varchar(255) DEFAULT NULL,
  `PrimerVencimiento` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `VentasEC`
--

CREATE TABLE `VentasEC` (
  `FECHA` varchar(255) DEFAULT NULL,
  `CTE` varchar(255) DEFAULT NULL,
  `Prestamo` varchar(255) DEFAULT NULL,
  `Zona` varchar(255) DEFAULT NULL,
  `Valor` varchar(255) DEFAULT NULL,
  `Capital` varchar(255) DEFAULT NULL,
  `Ant` varchar(255) DEFAULT NULL,
  `AGO` varchar(255) DEFAULT NULL,
  `SEP` varchar(255) DEFAULT NULL,
  `OCT` varchar(255) DEFAULT NULL,
  `NOV` varchar(255) DEFAULT NULL,
  `DIC` varchar(255) DEFAULT NULL,
  `ENE` varchar(255) DEFAULT NULL,
  `Saldo Ant` varchar(255) DEFAULT NULL,
  `FEB` varchar(255) DEFAULT NULL,
  `Saldo Act` varchar(255) DEFAULT NULL,
  `Cuota` varchar(255) DEFAULT NULL,
  `Cuo` varchar(255) DEFAULT NULL,
  `Entregado` varchar(255) DEFAULT NULL,
  `V` varchar(255) DEFAULT NULL,
  `Fecha cobro` varchar(255) DEFAULT NULL,
  `C De Fecha` varchar(255) DEFAULT NULL,
  `Prox Fecha` varchar(255) DEFAULT NULL,
  `SERVICIOS ANT` varchar(255) DEFAULT NULL,
  `SERVICIOS PAGO` varchar(255) DEFAULT NULL,
  `SERVICIOS` varchar(255) DEFAULT NULL,
  `MORA ANT` varchar(255) DEFAULT NULL,
  `MORA PAGA` varchar(255) DEFAULT NULL,
  `MORA` varchar(255) DEFAULT NULL,
  `Congelada` varchar(255) DEFAULT NULL,
  `MORA UNIT` varchar(255) DEFAULT NULL,
  `Vencidas` varchar(255) DEFAULT NULL,
  `Deuda Cuo` varchar(255) DEFAULT NULL,
  `FECHAActual` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
