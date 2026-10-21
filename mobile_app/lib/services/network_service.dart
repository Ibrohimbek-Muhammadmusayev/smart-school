import 'dart:async';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import '../theme.dart';

class NetworkService {
  static final Connectivity _connectivity = Connectivity();

  /// Haqiqiy internet aloqasi mavjudligini tekshiradi (DNS / socket tekshiruvi bilan)
  static Future<bool> hasInternet() async {
    try {
      final results = await _connectivity.checkConnectivity();
      if (results.contains(ConnectivityResult.none) && results.length == 1) {
        return false;
      }
      // Haqiqiy internet mavjudligini tezkor tekshirish
      final lookup = await InternetAddress.lookup('google.com')
          .timeout(const Duration(seconds: 4));
      return lookup.isNotEmpty && lookup[0].rawAddress.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  /// Internet o'zgarishini tinglash oqimi
  static Stream<bool> get onConnectionChange {
    return _connectivity.onConnectivityChanged.asyncMap((results) async {
      if (results.contains(ConnectivityResult.none) && results.length == 1) {
        return false;
      }
      return await hasInternet();
    });
  }

  /// Internet yo'qligi haqida modal ogohlantirish oynasi
  static Future<bool> ensureOnline(BuildContext context) async {
    final online = await hasInternet();
    if (online) return true;

    if (!context.mounted) return false;
    return await showOfflineDialog(context);
  }

  /// Offline ogohlantirish dialogi
  static Future<bool> showOfflineDialog(BuildContext context) async {
    bool isChecking = false;

    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              titlePadding: const EdgeInsets.only(top: 24, left: 24, right: 24),
              contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              actionsPadding: const EdgeInsets.only(bottom: 20, left: 20, right: 20),
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.wifi_off_rounded, color: Colors.red.shade700, size: 26),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Text(
                      "Internet aloqasi yo'q!",
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                    ),
                  ),
                ],
              ),
              content: const Text(
                "Smart School tizimi real-vaqt rejimida (Face ID biometriya, Hikvision turniketlar va jonli dars davomati) ishlagani sababli ilova faqat ONLAYN rejimda ishlaydi.\n\nIltimos, Wi-Fi yoki mobil internetni yoqing va qayta tekshiring.",
                style: TextStyle(fontSize: 14, height: 1.5, color: Color(0xFF555B6E)),
              ),
              actions: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      elevation: 0,
                    ),
                    onPressed: isChecking
                        ? null
                        : () async {
                            setDialogState(() => isChecking = true);
                            final connected = await NetworkService.hasInternet();
                            setDialogState(() => isChecking = false);
                            if (connected && ctx.mounted) {
                              Navigator.of(ctx).pop(true);
                            } else {
                              if (ctx.mounted) {
                                ScaffoldMessenger.of(ctx).hideCurrentSnackBar();
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  SnackBar(
                                    content: const Text("Internet hali mavjud emas. Qaytadan urinib ko'ring."),
                                    backgroundColor: Colors.red.shade600,
                                    behavior: SnackBarBehavior.floating,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                );
                              }
                            }
                          },
                    icon: isChecking
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Icon(Icons.refresh_rounded, size: 20),
                    label: Text(
                      isChecking ? "Tekshirilmoqda..." : "Qayta tekshirish",
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                ),
              ],
            );
          },
        );
      },
    );

    return result ?? false;
  }
}
