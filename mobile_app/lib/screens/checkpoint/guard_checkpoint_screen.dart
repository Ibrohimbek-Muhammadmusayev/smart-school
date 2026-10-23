import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import '../login_screen.dart';

class GuardCheckpointScreen extends StatefulWidget {
  const GuardCheckpointScreen({super.key});

  @override
  State<GuardCheckpointScreen> createState() => _GuardCheckpointScreenState();
}

class _GuardCheckpointScreenState extends State<GuardCheckpointScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
  );
  final TextEditingController _searchController = TextEditingController();

  bool _isScanningLocked = false;
  String? _scanErrorMessage;

  // Qidiruv holati
  List<dynamic> _searchResults = [];
  bool _isSearching = false;
  Timer? _debounceTimer;

  // Statistika
  Map<String, dynamic>? _todayStats;
  Timer? _statsTimer;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadStats();
    _performSearch('');

    // Har 10 soniyada statistikani yangilab turish
    _statsTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      if (mounted) _loadStats();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scannerController.dispose();
    _searchController.dispose();
    _debounceTimer?.cancel();
    _statsTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadStats() async {
    final stats = await ApiService.getCheckpointStats();
    if (mounted && stats != null) {
      setState(() => _todayStats = stats);
    }
  }

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    setState(() => _isSearching = true);
    final results = await ApiService.searchCheckpointStudents(query);
    if (mounted) {
      setState(() {
        _searchResults = results;
        _isSearching = false;
      });
    }
  }

  // ===========================================================================
  // 1. QR SKANER ISHLASHI
  // ===========================================================================
  void _onQrDetected(BarcodeCapture capture) {
    if (_isScanningLocked) return;
    final barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final code = barcode.rawValue?.trim();
      if (code != null && code.isNotEmpty) {
        _processQrCode(code);
        break;
      }
    }
  }

  Future<void> _processQrCode(String qrCode) async {
    setState(() {
      _isScanningLocked = true;
      _scanErrorMessage = null;
    });

    try {
      final res = await ApiService.verifyCheckpointQR(qrCode);
      if (!mounted) return;

      if (res['success'] == true) {
        final student = res['student'];
        _loadStats();
        _performSearch(_searchController.text);

        // Natija dialogini chiqarish
        _showQrResultDialog(student, res['message']);
      } else {
        setState(() {
          _scanErrorMessage = res['detail'] ?? "QR kod tanilmadi";
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_scanErrorMessage!),
            backgroundColor: Colors.red.shade700,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _scanErrorMessage = "Ulanishda xatolik: $e");
      }
    } finally {
      // 2 soniyadan so'ng qayta skanerlashga ruxsat
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        setState(() => _isScanningLocked = false);
      }
    }
  }

  void _showQrResultDialog(Map<String, dynamic> student, String? msg) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) {
        final photoUrl = student['photo_url'];
        final fullPhoto = photoUrl != null
            ? (photoUrl.toString().startsWith('http') ? photoUrl : '${ApiService.serverUrl}$photoUrl')
            : null;

        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          contentPadding: const EdgeInsets.all(24),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: AppTheme.success.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded, color: AppTheme.success, size: 44),
              ),
              const SizedBox(height: 16),
              const Text(
                "KIRISH TASDIQLANDI",
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.success, letterSpacing: 1),
              ),
              const SizedBox(height: 8),
              if (fullPhoto != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    fullPhoto,
                    width: 90,
                    height: 110,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Icon(Icons.person, size: 70, color: Colors.grey),
                  ),
                )
              else
                CircleAvatar(
                  radius: 36,
                  backgroundColor: AppTheme.primaryLight,
                  child: const Icon(Icons.person, size: 40, color: AppTheme.primary),
                ),
              const SizedBox(height: 12),
              Text(
                student['full_name'] ?? 'Noma\'lum',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                "${student['class_name'] ?? ''} • ID: ${student['student_id'] ?? ''}",
                style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Text(
                  "Vaqt: ${student['time'] ?? 'Hozir'} ✅",
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.green.shade800),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text("Keyingi o'quvchi", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ===========================================================================
  // 2. YUZNI SURATGA OLISH VA SOLISHTIRISH OYNASI
  // ===========================================================================
  void _openFaceVerificationFlow(Map<String, dynamic> student) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FaceVerifyModal(
        student: student,
        onVerified: () {
          _loadStats();
          _performSearch(_searchController.text);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final schoolName = ApiService.schoolName;
    final enteredCount = _todayStats?['entered_count'] ?? 0;
    final totalStudents = _todayStats?['total_students'] ?? 0;
    final rate = _todayStats?['attendance_rate'] ?? 0.0;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.security_rounded, color: AppTheme.primary, size: 20),
                ),
                const SizedBox(width: 8),
                const Text(
                  "Kirish Nazorati Kioski",
                  style: TextStyle(color: Colors.black87, fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            Text(
              schoolName,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: "Chiqish",
            icon: const Icon(Icons.logout_rounded, color: Colors.black54),
            onPressed: () {
              ApiService.logout();
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primary,
          unselectedLabelColor: Colors.grey.shade600,
          indicatorColor: AppTheme.primary,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(icon: Icon(Icons.qr_code_scanner_rounded), text: "QR Skaner"),
            Tab(icon: Icon(Icons.person_search_rounded), text: "Qidiruv & Yuz ID"),
            Tab(icon: Icon(Icons.history_rounded), text: "Tarix"),
          ],
        ),
      ),
      body: Column(
        children: [
          // Yuqori jami ko'rsatkichlar paneli
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Colors.white,
            child: Row(
              children: [
                Expanded(
                  child: _buildMiniStat(
                    title: "Bugun kirdi",
                    value: "$enteredCount / $totalStudents",
                    icon: Icons.how_to_reg_rounded,
                    color: AppTheme.success,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildMiniStat(
                    title: "Davomat",
                    value: "$rate%",
                    icon: Icons.percent_rounded,
                    color: AppTheme.primary,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildMiniStat(
                    title: "QR / Yuz",
                    value: "${_todayStats?['qr_count'] ?? 0} / ${_todayStats?['face_count'] ?? 0}",
                    icon: Icons.fingerprint_rounded,
                    color: Colors.deepPurple,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // Asosiy Tablar
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // 1. QR Skaner Tabi
                _buildQrScannerTab(),

                // 2. Qidiruv va Yuzni Tekshirish Tabi
                _buildSearchAndFaceTab(),

                // 3. Tarix Tabi
                _buildHistoryTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, style: TextStyle(fontSize: 10, color: Colors.grey.shade600, fontWeight: FontWeight.w500)),
                Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // TAB 1: QR SKANER
  // ===========================================================================
  Widget _buildQrScannerTab() {
    return Stack(
      children: [
        MobileScanner(
          controller: _scannerController,
          onDetect: _onQrDetected,
        ),
        // Oyna ustidagi skanerlash ramkasi va yo'naltiruvchi
        Center(
          child: Container(
            width: 260,
            height: 260,
            decoration: BoxDecoration(
              border: Border.all(
                color: _isScanningLocked ? AppTheme.success : Colors.white,
                width: 3,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Stack(
              children: [
                if (_isScanningLocked)
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.success.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(21),
                    ),
                    child: const Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    ),
                  ),
              ],
            ),
          ),
        ),

        // Yuqori yo'riqnoma
        Positioned(
          top: 20,
          left: 20,
          right: 20,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.7),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.qr_code_scanner, color: Colors.white, size: 18),
                SizedBox(width: 8),
                Text(
                  "O'quvchi QR kodini doiraga tuting",
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),

        // Pastki tugmalar (Chiroq va Kamera almashtirish)
        Positioned(
          bottom: 30,
          left: 40,
          right: 40,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withValues(alpha: 0.85),
                  padding: const EdgeInsets.all(14),
                ),
                icon: const Icon(Icons.flash_on_rounded, color: Colors.black87),
                onPressed: () => _scannerController.toggleTorch(),
              ),
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withValues(alpha: 0.85),
                  padding: const EdgeInsets.all(14),
                ),
                icon: const Icon(Icons.cameraswitch_rounded, color: Colors.black87),
                onPressed: () => _scannerController.switchCamera(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ===========================================================================
  // TAB 2: QIDIRUV VA YUZ TEKSHIRUVI
  // ===========================================================================
  Widget _buildSearchAndFaceTab() {
    return Column(
      children: [
        // Qidiruv paneli
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.white,
          child: TextField(
            controller: _searchController,
            onChanged: _onSearchChanged,
            decoration: InputDecoration(
              hintText: "O'quvchi F.I.SH yoki 5 xonali ID...",
              prefixIcon: const Icon(Icons.search, color: AppTheme.primary),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 20),
                      onPressed: () {
                        _searchController.clear();
                        _performSearch('');
                      },
                    )
                  : null,
              filled: true,
              fillColor: const Color(0xFFF1F5F9),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),
        const Divider(height: 1, color: Color(0xFFE2E8F0)),

        // Ro'yxat
        Expanded(
          child: _isSearching
              ? const Center(child: CircularProgressIndicator())
              : _searchResults.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.person_off_rounded, size: 60, color: Colors.grey.shade400),
                          const SizedBox(height: 12),
                          Text(
                            "O'quvchi topilmadi",
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "Ism, familiya yoki ID raqamini tekshirib ko'ring",
                            style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(14),
                      itemCount: _searchResults.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final student = _searchResults[index];
                        final photoUrl = student['photo_url'];
                        final fullPhoto = photoUrl != null
                            ? (photoUrl.toString().startsWith('http') ? photoUrl : '${ApiService.serverUrl}$photoUrl')
                            : null;
                        final todayEntry = student['today_entry'];
                        final hasEntered = todayEntry != null && todayEntry['entered'] == true;

                        return Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: hasEntered ? Colors.green.shade200 : const Color(0xFFE2E8F0),
                              width: hasEntered ? 1.5 : 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            leading: Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: fullPhoto != null
                                      ? Image.network(
                                          fullPhoto,
                                          width: 50,
                                          height: 50,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => _avatarFallback(),
                                        )
                                      : _avatarFallback(),
                                ),
                                if (hasEntered)
                                  Positioned(
                                    right: -2,
                                    bottom: -2,
                                    child: Container(
                                      padding: const EdgeInsets.all(2),
                                      decoration: const BoxDecoration(
                                        color: Colors.white,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.check_circle, color: AppTheme.success, size: 18),
                                    ),
                                  ),
                              ],
                            ),
                            title: Text(
                              student['full_name'] ?? 'Noma\'lum',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primaryLight,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        student['class_name'] ?? 'Sinfsiz',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primary),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      "ID: ${student['student_id'] ?? ''}",
                                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                    ),
                                  ],
                                ),
                                if (hasEntered) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    "Kirdi: ${todayEntry['time']} (${todayEntry['method'] ?? 'Face ID'}) ✅",
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.green.shade700),
                                  ),
                                ],
                              ],
                            ),
                            trailing: ElevatedButton.icon(
                              onPressed: () => _openFaceVerificationFlow(student),
                              icon: const Icon(Icons.camera_alt_rounded, size: 16),
                              label: const Text("Yuzni tekshirish", style: TextStyle(fontSize: 12)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: hasEntered ? Colors.grey.shade200 : AppTheme.primary,
                                foregroundColor: hasEntered ? Colors.grey.shade800 : Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }

  Widget _avatarFallback() {
    return Container(
      width: 50,
      height: 50,
      color: const Color(0xFFF1F5F9),
      child: const Icon(Icons.person, color: Colors.grey),
    );
  }

  // ===========================================================================
  // TAB 3: TARIX
  // ===========================================================================
  Widget _buildHistoryTab() {
    final recentLogs = (_todayStats?['recent_logs'] as List<dynamic>?) ?? [];

    if (recentLogs.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadStats,
        child: ListView(
          children: [
            const SizedBox(height: 100),
            Center(
              child: Column(
                children: [
                  Icon(Icons.history_toggle_off_rounded, size: 60, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  Text(
                    "Bugun hali kirishlar qayd etilmadi",
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadStats,
      child: ListView.separated(
        padding: const EdgeInsets.all(14),
        itemCount: recentLogs.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final log = recentLogs[index];
          final photoUrl = log['photo_url'];
          final fullPhoto = photoUrl != null
              ? (photoUrl.toString().startsWith('http') ? photoUrl : '${ApiService.serverUrl}$photoUrl')
              : null;
          final isQr = log['event_type'] == 'QR_CODE';

          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: ListTile(
              leading: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: fullPhoto != null
                    ? Image.network(
                        fullPhoto,
                        width: 44,
                        height: 44,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _avatarFallback(),
                      )
                    : _avatarFallback(),
              ),
              title: Text(
                log['student_name'] ?? 'Noma\'lum',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              subtitle: Text(
                "${log['class_name'] ?? ''} • ${log['time'] ?? ''}",
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isQr ? Colors.blue.shade50 : Colors.purple.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isQr ? Colors.blue.shade200 : Colors.purple.shade200),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isQr ? Icons.qr_code_rounded : Icons.face_rounded,
                      size: 14,
                      color: isQr ? Colors.blue.shade700 : Colors.purple.shade700,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isQr ? "QR Kod" : "Face ID",
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isQr ? Colors.blue.shade700 : Colors.purple.shade700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}


// =============================================================================
// YUZNI SURATGA OLISH VA BAZADAGI RASM BILAN SOLISHTIRISH MODALI
// =============================================================================
class FaceVerifyModal extends StatefulWidget {
  final Map<String, dynamic> student;
  final VoidCallback onVerified;

  const FaceVerifyModal({
    super.key,
    required this.student,
    required this.onVerified,
  });

  @override
  State<FaceVerifyModal> createState() => _FaceVerifyModalState();
}

class _FaceVerifyModalState extends State<FaceVerifyModal> {
  CameraController? _cameraController;
  bool _isCameraReady = false;
  String? _cameraError;
  int _selectedCameraIndex = 0;
  List<CameraDescription> _availableCameras = [];

  XFile? _capturedImage;
  bool _isVerifying = false;
  String? _verificationResultMsg;
  bool? _isMatched;
  double? _confidence;

  @override
  void initState() {
    super.initState();
    _setupCamera();
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  Future<void> _setupCamera() async {
    try {
      _availableCameras = await availableCameras();
      if (_availableCameras.isEmpty) {
        setState(() => _cameraError = "Qurilmada kamera topilmadi");
        return;
      }

      // Default: Orqa kamera (qorovul o'quvchini rasmga oladi)
      int targetIndex = 0;
      for (int i = 0; i < _availableCameras.length; i++) {
        if (_availableCameras[i].lensDirection == CameraLensDirection.back) {
          targetIndex = i;
          break;
        }
      }
      _selectedCameraIndex = targetIndex;
      await _initController(_availableCameras[targetIndex]);
    } catch (e) {
      if (mounted) setState(() => _cameraError = "Kamera xatosi: $e");
    }
  }

  Future<void> _initController(CameraDescription description) async {
    _cameraController?.dispose();
    final ctrl = CameraController(
      description,
      ResolutionPreset.medium,
      enableAudio: false,
    );
    _cameraController = ctrl;

    try {
      await ctrl.initialize();
      if (mounted) setState(() => _isCameraReady = true);
    } catch (e) {
      if (mounted) setState(() => _cameraError = "Initsializatsiya xatosi: $e");
    }
  }

  void _switchCamera() {
    if (_availableCameras.length < 2) return;
    _selectedCameraIndex = (_selectedCameraIndex + 1) % _availableCameras.length;
    setState(() => _isCameraReady = false);
    _initController(_availableCameras[_selectedCameraIndex]);
  }

  Future<void> _takePhoto() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;

    try {
      final file = await _cameraController!.takePicture();
      setState(() => _capturedImage = file);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Suratga olishda xatolik: $e")),
        );
      }
    }
  }

  Future<void> _submitVerification() async {
    if (_capturedImage == null) return;

    setState(() {
      _isVerifying = true;
      _verificationResultMsg = null;
    });

    try {
      final bytes = await _capturedImage!.readAsBytes();
      final base64Image = base64Encode(bytes);

      final res = await ApiService.verifyCheckpointFace(
        widget.student['id'],
        base64Image,
      );

      if (!mounted) return;

      final matched = res['match'] == true;
      final conf = (res['confidence'] as num?)?.toDouble() ?? (matched ? 95.0 : 25.0);
      final msg = res['message'] ?? (matched ? "Shaxs tasdiqlandi! ✅" : "Shaxs mos kelmadi! ❌");

      setState(() {
        _isVerifying = false;
        _isMatched = matched;
        _confidence = conf;
        _verificationResultMsg = msg;
      });

      if (matched) {
        widget.onVerified();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isVerifying = false;
          _isMatched = false;
          _verificationResultMsg = "Server bilan aloqada xatolik: $e";
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final photoUrl = widget.student['photo_url'];
    final fullRefPhoto = photoUrl != null
        ? (photoUrl.toString().startsWith('http') ? photoUrl : '${ApiService.serverUrl}$photoUrl')
        : null;

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // Drag handle
          const SizedBox(height: 12),
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.student['full_name'] ?? 'O\'quvchi',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        "${widget.student['class_name'] ?? ''} • ID: ${widget.student['student_id'] ?? ''}",
                        style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Asosiy kontent
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Ikkala surat solishtiruvi (Bazadagi rasm vs Olingan surat)
                  Row(
                    children: [
                      // 1. Bazadagi 3x4 rasm
                      Expanded(
                        child: Column(
                          children: [
                            const Text(
                              "Bazadagi 3x4 rasm",
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              height: 160,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.grey.shade300),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(15),
                                child: fullRefPhoto != null
                                    ? Image.network(
                                        fullRefPhoto,
                                        fit: BoxFit.cover,
                                        width: double.infinity,
                                        errorBuilder: (_, __, ___) => const Center(
                                          child: Icon(Icons.person, size: 60, color: Colors.grey),
                                        ),
                                      )
                                    : const Center(
                                        child: Text(
                                          "Surat yo'q",
                                          style: TextStyle(color: Colors.red, fontSize: 12),
                                        ),
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),

                      // 2. Kameradan olingan jonli surat
                      Expanded(
                        child: Column(
                          children: [
                            const Text(
                              "Kameradan olingan surat",
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              height: 160,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: _capturedImage != null
                                      ? (_isMatched == true
                                          ? AppTheme.success
                                          : (_isMatched == false ? Colors.red : AppTheme.primary))
                                      : Colors.grey.shade300,
                                  width: _capturedImage != null ? 2 : 1,
                                ),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(15),
                                child: _capturedImage != null
                                    ? FutureBuilder<List<int>>(
                                        future: _capturedImage!.readAsBytes(),
                                        builder: (ctx, snap) {
                                          if (snap.hasData) {
                                            return Image.memory(
                                              Uint8List.fromList(snap.data!),
                                              fit: BoxFit.cover,
                                              width: double.infinity,
                                            );
                                          }
                                          return const Center(child: CircularProgressIndicator());
                                        },
                                      )
                                    : Center(
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Icon(Icons.camera_alt_outlined, size: 36, color: Colors.grey.shade400),
                                            const SizedBox(height: 4),
                                            Text(
                                              "Surat olinmadi",
                                              style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                                            ),
                                          ],
                                        ),
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Natija xabari (Agar mavjud bo'lsa)
                  if (_verificationResultMsg != null) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: _isMatched == true ? Colors.green.shade50 : Colors.red.shade50,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _isMatched == true ? Colors.green.shade300 : Colors.red.shade300,
                        ),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Icon(
                                _isMatched == true ? Icons.check_circle_rounded : Icons.cancel_rounded,
                                color: _isMatched == true ? AppTheme.success : Colors.red.shade700,
                                size: 28,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  _verificationResultMsg!,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: _isMatched == true ? Colors.green.shade900 : Colors.red.shade900,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          if (_confidence != null) ...[
                            const SizedBox(height: 8),
                            Align(
                              alignment: Alignment.centerRight,
                              child: Text(
                                "Biometrik aniqlik: ${_confidence!.toStringAsFixed(1)}%",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: _isMatched == true ? Colors.green.shade800 : Colors.red.shade800,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Jonli Kamera oynasi (agar hali rasm olinmagan bo'lsa yoki qayta olish bosilsa)
                  if (_capturedImage == null) ...[
                    Container(
                      height: 240,
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            if (_isCameraReady && _cameraController != null)
                              CameraPreview(_cameraController!)
                            else
                              Center(
                                child: _cameraError != null
                                    ? Text(_cameraError!, style: const TextStyle(color: Colors.white70))
                                    : const CircularProgressIndicator(color: Colors.white),
                              ),
                            // Yuz yo'naltiruvchi oval ramka
                            Center(
                              child: Container(
                                width: 140,
                                height: 180,
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.8), width: 2),
                                  borderRadius: BorderRadius.circular(90),
                                ),
                              ),
                            ),
                            // Kamera almashtirish tugmasi
                            Positioned(
                              top: 10,
                              right: 10,
                              child: IconButton(
                                style: IconButton.styleFrom(
                                  backgroundColor: Colors.black54,
                                ),
                                icon: const Icon(Icons.cameraswitch, color: Colors.white, size: 20),
                                onPressed: _switchCamera,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Suratga olish tugmasi
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isCameraReady ? _takePhoto : null,
                        icon: const Icon(Icons.camera_rounded),
                        label: const Text("Suratga olish"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ),
                  ] else ...[
                    // Rasm olindi: Tasdiqlash yoki Qayta suratga olish
                    if (_isMatched == true) ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => Navigator.pop(context),
                          icon: const Icon(Icons.done_all_rounded),
                          label: const Text("Bajarildi (Yopish)"),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.success,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ),
                    ] else ...[
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                setState(() {
                                  _capturedImage = null;
                                  _verificationResultMsg = null;
                                  _isMatched = null;
                                });
                              },
                              icon: const Icon(Icons.refresh_rounded),
                              label: const Text("Qayta olish"),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            flex: 2,
                            child: ElevatedButton.icon(
                              onPressed: _isVerifying ? null : _submitVerification,
                              icon: _isVerifying
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                    )
                                  : const Icon(Icons.fingerprint_rounded),
                              label: Text(_isVerifying ? "Tekshirilmoqda..." : "Tasdiqlash (Face ID)"),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
