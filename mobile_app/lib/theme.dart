import 'package:flutter/material.dart';

class AppTheme {
  // "Easy Learn" Trendy Purple UI Kit Ranglari (Yuborilgan Figma UI screenshotiga 100% mos)
  static const Color primary = Color(0xFF6C5CE7); // Royal Purple / Violet (Asosiy aksent)
  static const Color primaryDark = Color(0xFF5A4AD1); // To'q Binafsha
  static const Color primaryLight = Color(0xFFF1F0FF); // Och Binafsha fon
  static const Color primaryGradientStart = Color(0xFF7C69EF);
  static const Color primaryGradientEnd = Color(0xFF5845D8);

  // Qo'shimcha yorqin ranglar (Courses & Categories kartalari)
  static const Color secondaryOrange = Color(0xFFFF9F43); // Iliq apelsin / sariq aksent
  static const Color secondaryPink = Color(0xFFFF6584); // Pushti / Coral
  static const Color secondaryBlue = Color(0xFF48DBFB); // Cyan / Havorang
  static const Color secondaryGreen = Color(0xFF10AC84); // Mint Yashil

  // Fon va kartalar
  static const Color accent = Color(0xFF6C5CE7); // Royal Purple
  static const Color accentLight = Color(0xFFF1F0FF); // Och binafsha fon
  static const Color background = Color(0xFFF8F9FE); // Yumshoq oqish-binafsha fon
  static const Color cardBg = Colors.white;
  static const Color textDark = Color(0xFF222436); // To'q ko'k-kulrang sarlavhalar
  static const Color textMuted = Color(0xFF8A90A2); // Yumshoq matnlar
  static const Color success = Color(0xFF10AC84);
  static const Color warning = Color(0xFFFF9F43);

  // Gradientlar (Figma screenshotidagi kartalar va bannerlar kabi)
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryGradientStart, primaryGradientEnd],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient warmGradient = LinearGradient(
    colors: [Color(0xFFFF9F43), Color(0xFFFF6584)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData theme = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: background,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primary,
      primary: primary,
      surface: cardBg,
    ),
    fontFamily: 'Roboto',
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: textDark,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
      iconTheme: IconThemeData(color: textDark),
    ),
    cardTheme: CardThemeData(
      color: cardBg,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: Colors.black.withValues(alpha: 0.04)),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      hintStyle: const TextStyle(color: Color(0xFFB4B9C8), fontSize: 14),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.05)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.05)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: const BorderSide(color: primary, width: 1.8),
      ),
    ),
  );
}
