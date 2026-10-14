import 'dart:async';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../services/api_service.dart';
import '../../theme.dart';

class ProfileIdentityModal extends StatefulWidget {
  const ProfileIdentityModal({super.key});

  @override
  State<ProfileIdentityModal> createState() => _ProfileIdentityModalState();
}

class _ProfileIdentityModalState extends State<ProfileIdentityModal> {
  bool _highBrightness = false;
  String _qrToken = "SMART_TURNIKET_USER_INIT";
  int _secondsLeft = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _generateToken();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      setState(() {
        if (_secondsLeft > 1) {
          _secondsLeft--;
        } else {
          _secondsLeft = 30;
          _generateToken();
        }
      });
    });
  }

  void _generateToken() {
    final user = ApiService.currentUser ?? {};
    final id = user['student_id'] ?? user['username'] ?? '65167';
    _qrToken = "TURNIKET_${id}_${DateTime.now().millisecondsSinceEpoch}";
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ApiService.currentUser ?? {};
    final fullName = user['full_name'] ?? 'Talaba';
    final studentId = user['student_id'] ?? user['username'] ?? '65167';
    final className = user['class_name'] ?? '9-A';
    final passport = user['passport_series'] ?? 'AA 1234567';

    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            children: [
              // Drag Indicator
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Title
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Shaxsiy Guvohnoma & Turniket",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close_rounded, color: AppTheme.textMuted),
                  )
                ],
              ),
              const SizedBox(height: 14),

              // Turniket Katta QR Kod Kartochkasi (TOTP)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(26),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary.withValues(alpha: 0.08),
                      blurRadius: 20,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryLight,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.qr_code_2_rounded, color: AppTheme.primary, size: 20),
                            ),
                            const SizedBox(width: 10),
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text("Turniket Ruxsatnomasi", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textDark)),
                                Text("Bino kirish-chiqishi uchun", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.success.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Text("FAOL", style: TextStyle(color: AppTheme.success, fontWeight: FontWeight.bold, fontSize: 11)),
                        )
                      ],
                    ),
                    const SizedBox(height: 20),

                    // QR code
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.primaryLight, width: 2),
                      ),
                      child: QrImageView(
                        data: _qrToken,
                        version: QrVersions.auto,
                        size: 190.0,
                        eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppTheme.primary),
                        dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.circle, color: AppTheme.textDark),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Timer
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.sync_rounded, size: 14, color: AppTheme.primary),
                        const SizedBox(width: 6),
                        Text(
                          "Yangi kod: $_secondsLeft soniya",
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 13),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Yorqinlikni oshirish tugmasi
                    InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () {
                        setState(() => _highBrightness = !_highBrightness);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(_highBrightness ? "Ekran maksimal yorqinlikka o'tkazildi ☀️" : "Standart yorqinlikka qaytarildi 🌙"),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: _highBrightness ? const Color(0xFFFFF9E6) : AppTheme.background,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: _highBrightness ? AppTheme.secondaryOrange : Colors.black.withValues(alpha: 0.05),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _highBrightness ? Icons.brightness_high_rounded : Icons.brightness_auto_rounded,
                              size: 18,
                              color: _highBrightness ? AppTheme.secondaryOrange : AppTheme.textDark,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _highBrightness ? "Yorqinlik yoqilgan ☀️" : "Ekran yorqinligini oshirish",
                              style: TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.bold,
                                color: _highBrightness ? AppTheme.secondaryOrange : AppTheme.textDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Talaba Shaxsiy Rekvizitlari
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                ),
                child: Column(
                  children: [
                    _buildRow(Icons.person_outline, "F.I.Sh.", fullName),
                    const Divider(height: 22),
                    _buildRow(Icons.pin_outlined, "Talaba ID (5 xonali)", studentId),
                    const Divider(height: 22),
                    _buildRow(Icons.school_outlined, "Guruh / Sinf", className),
                    const Divider(height: 22),
                    _buildRow(Icons.badge_outlined, "Pasport / Hujjat", passport),
                    const Divider(height: 22),
                    _buildRow(Icons.fingerprint_rounded, "JSHSHIR", "32801994560021"),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Telegram Bot Ulanish Bloki
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF229ED9), Color(0xFF1E88E5)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF229ED9).withValues(alpha: 0.3),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.send_rounded, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Telegram Bot Bildirishnomalari", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                          SizedBox(height: 2),
                          Text("Turniket va baholarni Telegramda oling", style: TextStyle(color: Colors.white70, fontSize: 11)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text("Ulash ➔", style: TextStyle(color: Color(0xFF1E88E5), fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Tizimdan chiqish (Logout)
              SizedBox(
                width: double.infinity,
                child: TextButton.icon(
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.red.shade700,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () {
                    ApiService.accessToken = null;
                    ApiService.currentUser = null;
                    Navigator.pop(context);
                    Navigator.pushReplacementNamed(context, '/');
                  },
                  icon: const Icon(Icons.logout_rounded, size: 20),
                  label: const Text("Tizimdan chiqish (Logout)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(IconData icon, String title, String val) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppTheme.textMuted),
        const SizedBox(width: 12),
        Text(title, style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
        const Spacer(),
        Text(val, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
      ],
    );
  }
}
