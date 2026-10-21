import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import '../services/network_service.dart';
import '../theme.dart';
import 'face_verify_screen.dart';

class PassportInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    var text = newValue.text.toUpperCase();
    if (text.length > 10) return oldValue;

    // Filter characters
    final buffer = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      if (i < 2) {
        if (RegExp(r'[A-Z]').hasMatch(text[i])) {
          buffer.write(text[i]);
        }
      } else if (i == 2) {
        if (text[i] != ' ') {
          buffer.write(' ');
          if (RegExp(r'[0-9]').hasMatch(text[i])) {
            buffer.write(text[i]);
          }
        } else {
          buffer.write(' ');
        }
      } else {
        if (RegExp(r'[0-9]').hasMatch(text[i])) {
          buffer.write(text[i]);
        }
      }
    }

    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _loginIdController = TextEditingController(text: "23089");
  final _passwordController = TextEditingController(text: "pass123");
  bool _obscure = true;
  bool _loading = false;
  String? _error;

  void _onLogin() async {
    final online = await NetworkService.hasInternet();
    if (!online && mounted) {
      await NetworkService.showOfflineDialog(context);
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final res = await ApiService.login(
        _loginIdController.text.trim(),
        _passwordController.text,
      );

      if (res['require_face_id'] == true) {
        if (!mounted) return;
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => FaceVerifyScreen(
              userId: res['user_id'],
              fullName: res['full_name'],
              role: res['role'],
              photoUrl: res['photo_3x4'],
              hasRegisteredPhoto: res['has_registered_photo'] == true,
            ),
          ),
        );
      } else {
        setState(() => _error = res['detail'] ?? "Kirishda xatolik yuz berdi");
      }
    } catch (e) {
      setState(() => _error = "Server bilan bog'lanishda xatolik yuz berdi");
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showForgotDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        titlePadding: const EdgeInsets.fromLTRB(22, 22, 22, 12),
        contentPadding: const EdgeInsets.symmetric(horizontal: 22, vertical: 8),
        actionsPadding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        title: const Row(
          children: [
            Icon(Icons.info_outline_rounded, color: AppTheme.primary, size: 24),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                "Parolni unutdingizmi?",
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textDark,
                ),
              ),
            ),
          ],
        ),
        content: const Text(
          "Parolni tiklash uchun sinf rahbari yoki maktab ustozingizga murojaat qiling.\n\nUstoz o'z paneli orqali yangi vaqtinchalik parol taqdim eta oladi.",
          style: TextStyle(height: 1.45, fontSize: 13.5, color: Color(0xFF555B6E)),
        ),
        actions: [
          TextButton(
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Tushunarli", style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 14)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Illustration / Hero Header (Easy Learn Style)
                  Center(
                    child: Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withValues(alpha: 0.35),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.school_rounded, size: 52, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    "Idrok Edu",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.textDark,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    "Idrok Mobile — Davomat va Ta'lim Ekotizimi",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13.5, color: AppTheme.textMuted, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 36),

                  if (_error != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.error_outline, color: Colors.red.shade700, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _error!,
                              style: TextStyle(color: Colors.red.shade800, fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Kirish ID (5 xonali raqam) kiritish
                  const Text("Kirish ID raqami (5 xonali)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _loginIdController,
                    keyboardType: TextInputType.text,
                    decoration: InputDecoration(
                      hintText: "Masalan: 65167",
                      prefixIcon: const Icon(Icons.badge_outlined, color: AppTheme.primary),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.grey.shade200),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.grey.shade200),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Parol kiritish
                  const Text("Tizim paroli", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _passwordController,
                    obscureText: _obscure,
                    decoration: InputDecoration(
                      hintText: "••••••••",
                      prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppTheme.primary),
                      suffixIcon: IconButton(
                        icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, color: AppTheme.textMuted),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.grey.shade200),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.grey.shade200),
                      ),
                    ),
                  ),

                  // Forgot password
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: _showForgotDialog,
                      child: const Text("Parolni unutdingizmi?", style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Submit button
                  ElevatedButton(
                    onPressed: _loading ? null : _onLogin,
                    child: _loading
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text("Davom etish  ➔"),
                  ),
                  const SizedBox(height: 24),

                  // Tezkor test hisoblari yordamchisi
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.accentLight,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("💡 Sinov uchun tayyor 5 xonali hisoblar:", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.accent)),
                        const SizedBox(height: 6),
                        InkWell(
                          onTap: () {
                            setState(() {
                              _loginIdController.text = "65167";
                              _passwordController.text = "pass123";
                            });
                          },
                          child: const Text("• O'quvchi (Vali): ID: 65167 / pass123", style: TextStyle(fontSize: 12, color: AppTheme.textDark)),
                        ),
                        const SizedBox(height: 4),
                        InkWell(
                          onTap: () {
                            setState(() {
                              _loginIdController.text = "12431";
                              _passwordController.text = "mypassword777";
                            });
                          },
                          child: const Text("• O'quvchi (Fotima): ID: 12431 / mypassword777", style: TextStyle(fontSize: 12, color: AppTheme.textDark)),
                        ),
                        const SizedBox(height: 4),
                        InkWell(
                          onTap: () {
                            setState(() {
                              _loginIdController.text = "20101";
                              _passwordController.text = "teacher123";
                            });
                          },
                          child: const Text("• O'qituvchi: ID: 20101 / teacher123", style: TextStyle(fontSize: 12, color: AppTheme.textDark)),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
