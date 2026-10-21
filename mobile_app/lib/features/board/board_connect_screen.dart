import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import 'board_control_screen.dart';

class BoardConnectScreen extends StatefulWidget {
  const BoardConnectScreen({super.key});

  @override
  State<BoardConnectScreen> createState() => _BoardConnectScreenState();
}

class _BoardConnectScreenState extends State<BoardConnectScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
  );
  final TextEditingController _manualTokenController = TextEditingController();

  bool _connecting = false;
  bool _checkingExisting = true;
  Map<String, dynamic>? _activeSession;

  @override
  void initState() {
    super.initState();
    _checkCurrentSession();
  }

  @override
  void dispose() {
    _scannerController.dispose();
    _manualTokenController.dispose();
    super.dispose();
  }

  Future<void> _checkCurrentSession() async {
    try {
      final res = await ApiService.getMyBoardSession();
      if (mounted) {
        setState(() {
          if (res['status'] == 'ACTIVE') {
            _activeSession = res;
          } else {
            _activeSession = null;
          }
          _checkingExisting = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _checkingExisting = false);
    }
  }

  Future<void> _connectToBoard(String? rawToken) async {
    final token = (rawToken ?? '').trim();
    if (token.isEmpty || _connecting) return;

    setState(() => _connecting = true);
    try {
      final res = await ApiService.connectToBoard(token);
      if (!mounted) return;

      if (res['session_id'] != null) {
        final sessionId = res['session_id'] as int;
        final deviceToken = (res['device_token'] ?? token).toString();
        final teacherName = (res['teacher_name'] ?? ApiService.currentUser?['full_name'] ?? 'Ustoz').toString();
        final deviceName = (res['device_name'] ?? 'IdrokBoard').toString();
        final geminiKey = (res['gemini_api_key'] ?? '').toString();
        final savedCanvases = (res['saved_canvases'] as List<dynamic>?) ?? [];

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(child: Text(res['message'] ?? "Doska muvaffaqiyatli ulandi! ✅")),
              ],
            ),
            backgroundColor: AppTheme.success,
          ),
        );

        await Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => BoardControlScreen(
              sessionId: sessionId,
              deviceToken: deviceToken,
              teacherName: teacherName,
              deviceName: deviceName,
              geminiApiKey: geminiKey,
              initialCanvases: savedCanvases,
            ),
          ),
        );
      } else {
        setState(() => _connecting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['detail'] ?? "Qurilma topilmadi. QR kodni qayta skanerlang."),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _connecting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Ulanishda xatolik: $e"),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  void _openExistingSession() {
    if (_activeSession == null) return;
    final user = ApiService.currentUser ?? {};
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => BoardControlScreen(
          sessionId: _activeSession!['session_id'] as int,
          deviceToken: (_activeSession!['device_token'] ?? '').toString(),
          teacherName: (user['full_name'] ?? 'Ustoz').toString(),
          deviceName: (_activeSession!['device_name'] ?? 'IdrokBoard').toString(),
          geminiApiKey: (_activeSession!['gemini_api_key'] ?? '').toString(),
          initialCanvases: (_activeSession!['saved_canvases'] as List<dynamic>?) ?? [],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Doskani Ulash (QR Skaner)"),
        actions: [
          IconButton(
            tooltip: "Chiroqni yoqish/o'chirish",
            onPressed: () => _scannerController.toggleTorch(),
            icon: const Icon(Icons.flash_on_rounded),
          ),
          IconButton(
            tooltip: "Kamerani almashtirish",
            onPressed: () => _scannerController.switchCamera(),
            icon: const Icon(Icons.cameraswitch_rounded),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Agar aktiv sessiya bo'lsa tezkor o'tish kartasi
            if (!_checkingExisting && _activeSession != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.success.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.success.withValues(alpha: 0.35)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: AppTheme.success,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.tv_rounded, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Faol doska: ${_activeSession!['device_name'] ?? 'IdrokBoard'}",
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: AppTheme.textDark,
                            ),
                          ),
                          const Text(
                            "Siz allaqachon doskaga ulangansiz",
                            style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.success,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: _openExistingSession,
                      child: const Text("Boshqarish ➔", style: TextStyle(fontSize: 12.5)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 1. Tushuntirish Hero Kartasi
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Elektron doska QR kodini skanerlang",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "Sinf xonasidagi Smart Doska ekranida ko'rinib turgan QR kodga kamerani yo'naltiring.",
                          style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.3),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 2. Kamera QR Skaner Oynasi (MobileScanner)
            Container(
              height: 310,
              decoration: BoxDecoration(
                color: const Color(0xFF1A1C29),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: AppTheme.primary, width: 2.5),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.18),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  MobileScanner(
                    controller: _scannerController,
                    onDetect: (capture) {
                      if (_connecting) return;
                      final barcodes = capture.barcodes;
                      if (barcodes.isNotEmpty) {
                        final raw = barcodes.first.rawValue;
                        if (raw != null && raw.trim().isNotEmpty) {
                          _connectToBoard(raw);
                        }
                      }
                    },
                  ),
                  // Vizual Skaner Ramkasi
                  Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.85), width: 2.5),
                    ),
                  ),
                  Positioned(
                    bottom: 14,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.65),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (_connecting) ...[
                            const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              "Doskaga ulanmoqda...",
                              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ] else ...[
                            const Icon(Icons.center_focus_strong_rounded, color: Colors.white, size: 16),
                            const SizedBox(width: 6),
                            const Text(
                              "QR kodni ramka markaziga tuting",
                              style: TextStyle(color: Colors.white, fontSize: 12),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 3. Tokenni qo'lda kiritish yoki Demo doskaga tezkor ulanish
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Yoki doska tokenini qo'lda kiriting:",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textDark),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _manualTokenController,
                          decoration: const InputDecoration(
                            hintText: "Doska tokeni (masalan: BOARD_302)",
                            isDense: true,
                          ),
                          style: const TextStyle(fontSize: 13),
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        onPressed: _connecting
                            ? null
                            : () => _connectToBoard(_manualTokenController.text),
                        child: const Text("Ulash", style: TextStyle(fontSize: 13.5)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primary,
                        side: BorderSide(color: AppTheme.primary.withValues(alpha: 0.35)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: _connecting
                          ? null
                          : () => _connectToBoard("SMART_BOARD_ROOM_302"),
                      icon: const Icon(Icons.tv_rounded, size: 18),
                      label: const Text(
                        "302-xona Elektron Doskasiga Tezkor Ulanish",
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
