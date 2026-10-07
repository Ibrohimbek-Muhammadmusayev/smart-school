import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'theme.dart';

void main() {
  runApp(const SmartSchoolApp());
}

class SmartSchoolApp extends StatelessWidget {
  const SmartSchoolApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart School',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: const LoginScreen(),
    );
  }
}
