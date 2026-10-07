import 'package:flutter/material.dart';

class AppTheme {
  // Rasmga to'liq mos keladigan zamonaviy Orange / Coral va Soft Grey palitrasi
  static const Color primary = Color(0xFFFF5722); // Deep Coral / Orange
  static const Color primaryLight = Color(0xFFFFECE5);
  static const Color accent = Color(0xFF6C5CE7); // Soft Purple
  static const Color accentLight = Color(0xFFF1F0FF);
  static const Color background = Color(0xFFF9F9FB); // Clean soft off-white
  static const Color cardBg = Colors.white;
  static const Color textDark = Color(0xFF1E2022);
  static const Color textMuted = Color(0xFF888A96);
  static const Color success = Color(0xFF00B894);
  static const Color warning = Color(0xFFFDCB6E);

  static ThemeData theme = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: background,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primary,
      primary: primary,
      surface: cardBg,
    ),
    fontFamily: 'Roboto',
    cardTheme: CardThemeData(
      color: cardBg,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: Colors.black.withOpacity(0.04)),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
    ),
  );
}
