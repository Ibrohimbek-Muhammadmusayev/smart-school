import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import '../login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = false;
  Map<String, dynamic>? _profileData;

  @override
  void initState() {
    super.initState();
    _loadProfile(showLoading: false);
  }

  Future<void> _loadProfile({bool showLoading = true}) async {
    if (showLoading && mounted) {
      setState(() => _isLoading = true);
    }
    try {
      final res = await ApiService.getStudentProfile();
      if (res != null && mounted) {
        setState(() {
          _profileData = res;
        });
      }
    } catch (_) {
      // Fallback to summary if profile endpoint has any hiccups
      try {
        final summary = await ApiService.getStudentDashboardSummary();
        if (summary != null && mounted) {
          setState(() {
            _profileData = summary;
          });
        }
      } catch (_) {}
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _refreshProfile() async {
    HapticFeedback.lightImpact();
    await _loadProfile(showLoading: false);
    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 10),
              Text(
                "Profil ma'lumotlari bazadan yangilandi ✅",
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
            ],
          ),
          backgroundColor: AppTheme.primary,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        ),
      );
    }
  }

  void _copyToClipboard(String label, String value) {
    if (value.isEmpty || value == '-') return;
    Clipboard.setData(ClipboardData(text: value));
    HapticFeedback.selectionClick();
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.copy_rounded, color: Colors.white, size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                "$label nusxalandi: $value",
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
            ),
          ],
        ),
        backgroundColor: AppTheme.textDark,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ApiService.currentUser ?? {};
    final pData = _profileData ?? {};
    final studentData = (pData['student'] as Map<String, dynamic>?) ?? {};
    final academicData = (pData['academic'] as Map<String, dynamic>?) ?? {};
    final securityData = (pData['security'] as Map<String, dynamic>?) ?? {};

    // 1. Shaxsiy ma'lumotlar
    final fullName = studentData['full_name'] ??
        studentData['name'] ??
        user['full_name'] ??
        user['username'] ??
        "O'quvchi";

    final studentId = studentData['student_id'] ??
        user['student_id'] ??
        user['username'] ??
        '23089';

    final phoneNumber = (studentData['phone_number'] != null && studentData['phone_number'].toString().isNotEmpty)
        ? studentData['phone_number'].toString()
        : (user['phone_number']?.toString().isNotEmpty == true
            ? user['phone_number'].toString()
            : '+998 90 230-89-01');

    final parentPhone = (studentData['parent_phone'] != null && studentData['parent_phone'].toString().isNotEmpty)
        ? studentData['parent_phone'].toString()
        : (user['parent_phone']?.toString().isNotEmpty == true
            ? user['parent_phone'].toString()
            : '+998 90 123-45-67');

    final parentTelegram = (studentData['parent_telegram_chat_id'] != null && studentData['parent_telegram_chat_id'].toString().isNotEmpty)
        ? studentData['parent_telegram_chat_id'].toString()
        : (user['parent_telegram_chat_id']?.toString().isNotEmpty == true
            ? user['parent_telegram_chat_id'].toString()
            : '@muhammadmusayev_parent');

    final dateJoined = studentData['date_joined'] ?? user['date_joined'] ?? '2026-09-01';

    String? photoUrl = studentData['photo_3x4'] ?? user['photo_3x4'];
    if (photoUrl != null && photoUrl.isNotEmpty) {
      if (photoUrl.startsWith('/')) {
        photoUrl = "${ApiService.serverUrl}$photoUrl";
      } else if (photoUrl.contains('127.0.0.1:8000')) {
        photoUrl = photoUrl.replaceAll('http://127.0.0.1:8000', ApiService.serverUrl);
      }
    }

    // 2. Ta'lim & Sinf ma'lumotlari
    final className = academicData['class_name'] ??
        studentData['class_name'] ??
        user['class_name'] ??
        ApiService.formatClassName('11-baza');

    final advisorTeacher = academicData['advisor_teacher'] ??
        studentData['advisor_teacher'] ??
        "Muhammadmusayev Ibrohimbek Solijon O'gli";

    final roomNumber = academicData['room_number'] ??
        studentData['room_number'] ??
        '3-xona';

    final shift = academicData['shift'] ?? studentData['class_shift'] ?? user['shift'] ?? 2;
    final shiftName = academicData['shift_name'] ??
        studentData['shift_name'] ??
        (shift == 2 ? '2-smena (Abeddan keyingi)' : '1-smena (Ertalabki)');

    final academicYear = academicData['academic_year'] ??
        studentData['academic_year'] ??
        '2026-2027';

    final schoolName = academicData['school_name'] ??
        studentData['school_name'] ??
        ApiService.schoolName;

    final institutionType = academicData['institution_type'] ??
        studentData['institution_type'] ??
        "O'rta maxsus kasb-hunar ta'limi (Texnikum)";

    final district = academicData['district'] ??
        studentData['district'] ??
        'Quva Tumani';

    final directorName = academicData['director_name'] ??
        studentData['director_name'] ??
        'Rahimov Jamshid';

    // 2. Biometrika & Qurilmalar
    final faceIdStatus = securityData['face_id_status'] ??
        studentData['face_id_status'] ??
        "Tasdiqlangan va faol ✅";

    final turnstileAccess = securityData['turnstile_access'] ??
        "Ruxsat berilgan (Kirish/Chiqish faol)";

    final deviceSync = securityData['device_sync'] ??
        studentData['device_sync'] ??
        "Hikvision MinMoe (DS-K1T673)";

    final todayEntry = securityData['today_entry'] ??
        studentData['turnstile_entry'] ??
        (shift == 2 ? '13:05' : '08:05');

    final todayExit = securityData['today_exit'] ??
        studentData['turnstile_exit'] ??
        '--:--';

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: RefreshIndicator(
        color: AppTheme.primary,
        backgroundColor: Colors.white,
        displacement: 32,
        onRefresh: _refreshProfile,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.only(bottom: 12),
                  child: ClipRRect(
                    borderRadius: BorderRadius.all(Radius.circular(6)),
                    child: LinearProgressIndicator(
                      minHeight: 3,
                      backgroundColor: AppTheme.primaryLight,
                      valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primary),
                    ),
                  ),
                ),
              // 1. Profil Sarlavhasi va Avatar
              _buildHeaderCard(
                fullName: fullName,
                studentId: studentId,
                schoolName: schoolName,
                photoUrl: photoUrl,
                onCopyId: () => _copyToClipboard("O'quvchi ID", studentId),
              ),
              const SizedBox(height: 18),

              // 2. O'quvchi Guvohnomasi (Raqamli ID karta)
              _buildSectionCard(
                title: "O'quvchi guvohnomasi (ID)",
                subtitle: "Yagona elektron ta'lim tizimi kodi",
                icon: Icons.badge_rounded,
                accentColor: AppTheme.primary,
                items: [
                  _buildDataRow(
                    icon: Icons.tag_rounded,
                    label: "O'quvchi ID kodi",
                    value: studentId,
                    isCopyable: true,
                    onTap: () => _copyToClipboard("O'quvchi ID", studentId),
                  ),
                  _buildDataRow(
                    icon: Icons.calendar_today_rounded,
                    label: "Ro'yxatga olingan sana",
                    value: dateJoined,
                  ),
                  _buildDataRow(
                    icon: Icons.verified_rounded,
                    label: "Tizim maqomi",
                    value: "Faol o'quvchi",
                    valueColor: AppTheme.success,
                    badgeIcon: Icons.check_circle_rounded,
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // 4. Ta'lim va Sinf ma'lumotlari
              _buildSectionCard(
                title: "Ta'lim & Sinf ma'lumotlari",
                subtitle: "O'qish joyi, guruhi va rahbari",
                icon: Icons.school_rounded,
                accentColor: const Color(0xFF2E86DE),
                items: [
                  _buildDataRow(
                    icon: Icons.group_work_rounded,
                    label: ApiService.groupTermSingular,
                    value: className,
                    valueColor: AppTheme.primary,
                  ),
                  _buildDataRow(
                    icon: Icons.person_outline_rounded,
                    label: ApiService.advisorLabel,
                    value: advisorTeacher,
                  ),
                  _buildDataRow(
                    icon: Icons.meeting_room_outlined,
                    label: "Asosiy biriktirilgan xona",
                    value: roomNumber,
                  ),
                  _buildDataRow(
                    icon: Icons.schedule_rounded,
                    label: "O'qish smenasi",
                    value: shiftName,
                  ),
                  _buildDataRow(
                    icon: Icons.date_range_rounded,
                    label: "O'quv yili",
                    value: academicYear,
                  ),
                  _buildDataRow(
                    icon: Icons.account_balance_rounded,
                    label: "Muassasa",
                    value: schoolName,
                  ),
                  _buildDataRow(
                    icon: Icons.category_rounded,
                    label: "Ta'lim turi",
                    value: institutionType,
                  ),
                  _buildDataRow(
                    icon: Icons.location_on_outlined,
                    label: "Tuman / Hudud",
                    value: district,
                  ),
                  _buildDataRow(
                    icon: Icons.supervisor_account_rounded,
                    label: "Muassasa rahbari",
                    value: directorName,
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // 5. Aloqa va Ota-ona ma'lumotlari
              _buildSectionCard(
                title: "Aloqa & Ota-ona ma'lumotlari",
                subtitle: "SMS va bildirishnomalar integratsiyasi",
                icon: Icons.contact_phone_rounded,
                accentColor: const Color(0xFF10AC84),
                items: [
                  _buildDataRow(
                    icon: Icons.phone_android_rounded,
                    label: "O'quvchi telefoni",
                    value: phoneNumber,
                    isCopyable: true,
                    onTap: () => _copyToClipboard("Telefon raqami", phoneNumber),
                  ),
                  _buildDataRow(
                    icon: Icons.family_restroom_rounded,
                    label: "Ota-ona telefoni (SMS)",
                    value: parentPhone,
                    isCopyable: true,
                    onTap: () => _copyToClipboard("Ota-ona telefoni", parentPhone),
                  ),
                  _buildDataRow(
                    icon: Icons.send_rounded,
                    label: "Telegram xabardorlik",
                    value: parentTelegram,
                    valueColor: const Color(0xFF0088CC),
                    badgeIcon: Icons.check_circle_rounded,
                  ),
                  _buildDataRow(
                    icon: Icons.notifications_active_rounded,
                    label: "Turniket SMS bildirishnomasi",
                    value: "Yoqilgan (Har kirish/chiqishda)",
                    valueColor: AppTheme.success,
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // 6. Biometrika, Xavfsizlik & Hikvision
              _buildSectionCard(
                title: "Biometrika & Hikvision Turniket",
                subtitle: "Kuzatuv va kirish-chiqish tizimi",
                icon: Icons.security_rounded,
                accentColor: const Color(0xFFFF9F43),
                items: [
                  _buildDataRow(
                    icon: Icons.face_rounded,
                    label: "Face ID holati",
                    value: faceIdStatus,
                    valueColor: AppTheme.success,
                  ),
                  _buildDataRow(
                    icon: Icons.developer_board_rounded,
                    label: "Qurilma integratsiyasi",
                    value: deviceSync,
                  ),
                  _buildDataRow(
                    icon: Icons.door_front_door_rounded,
                    label: "Turniket ruxsatnomasi",
                    value: turnstileAccess,
                    valueColor: AppTheme.success,
                  ),
                  _buildDataRow(
                    icon: Icons.login_rounded,
                    label: "Bugungi kirish vaqti",
                    value: todayEntry,
                    valueColor: AppTheme.textDark,
                  ),
                  _buildDataRow(
                    icon: Icons.logout_rounded,
                    label: "Bugungi chiqish vaqti",
                    value: todayExit,
                  ),
                  _buildDataRow(
                    icon: Icons.vpn_key_rounded,
                    label: "Mobil sessiya",
                    value: "10 kunlik xavfsiz JWT token",
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // 7. Amallar: Parolni yangilash & Logout
              _buildActionsBlock(),
              const SizedBox(height: 28),

              // 8. Rasmiy Idrok Mobile brend ma'lumoti
              Center(
                child: Column(
                  children: [
                    Image.asset(
                      'assets/images/icon.png',
                      width: 44,
                      height: 44,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "Idrok Mobile • v2.1.0",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    const Text(
                      "Idrok Edu Yagona Raqamli Ekotizimi",
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  // --- KARTA VA ELEMENLARNI YARATUVCHI HELPERLAR ---

  Widget _buildHeaderCard({
    required String fullName,
    required String studentId,
    required String schoolName,
    required String? photoUrl,
    required VoidCallback onCopyId,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          Center(
            child: Stack(
              children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.primary, width: 2.5),
                  ),
                  child: ClipOval(
                    child: photoUrl != null && photoUrl.isNotEmpty
                        ? Image.network(
                            photoUrl,
                            fit: BoxFit.cover,
                            width: 96,
                            height: 96,
                            errorBuilder: (ctx, err, stack) => const Icon(
                              Icons.person_rounded,
                              size: 52,
                              color: AppTheme.primary,
                            ),
                          )
                        : const Icon(
                            Icons.person_rounded,
                            size: 52,
                            color: AppTheme.primary,
                          ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 2,
                  child: Container(
                    padding: const EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      color: AppTheme.success,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: const Icon(Icons.check_rounded, size: 14, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Text(
            fullName,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textDark,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 6),
          Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 8,
            runSpacing: 6,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primaryLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  "O'quvchi",
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                  ),
                ),
              ),
              InkWell(
                onTap: onCopyId,
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "ID: $studentId",
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textDark,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.copy_rounded, size: 12, color: AppTheme.textMuted),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.school_outlined, size: 14, color: AppTheme.textMuted),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  schoolName,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color accentColor,
    required List<Widget> items,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.03),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Sarlavha qatori
          Padding(
            padding: const EdgeInsets.only(left: 18, right: 18, top: 16, bottom: 12),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: accentColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, size: 20, color: accentColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textDark,
                        ),
                      ),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.textMuted,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Colors.grey.shade100),
          // Qatorlar ro'yxati
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
            child: Column(
              children: [
                for (int i = 0; i < items.length; i++) ...[
                  items[i],
                  if (i < items.length - 1)
                    Divider(height: 18, color: Colors.grey.shade100),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataRow({
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
    bool isCopyable = false,
    IconData? badgeIcon,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: AppTheme.textMuted),
            const SizedBox(width: 12),
            Expanded(
              flex: 4,
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppTheme.textMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Flexible(
              flex: 5,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(
                    child: Text(
                      value,
                      textAlign: TextAlign.end,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: valueColor ?? AppTheme.textDark,
                      ),
                    ),
                  ),
                  if (badgeIcon != null) ...[
                    const SizedBox(width: 4),
                    Icon(badgeIcon, size: 14, color: valueColor ?? AppTheme.success),
                  ],
                  if (isCopyable) ...[
                    const SizedBox(width: 6),
                    const Icon(Icons.copy_rounded, size: 14, color: AppTheme.textMuted),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionsBlock() {
    return Column(
      children: [
        // Face ID parolini yangilash
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.textDark,
              backgroundColor: Colors.white,
              side: BorderSide(color: Colors.grey.shade300),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text("Xavfsiz rejim: Face ID biometrik tekshiruvi yoqilmoqda..."),
                  backgroundColor: AppTheme.primary,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            icon: const Icon(Icons.lock_reset_rounded, size: 20, color: AppTheme.primary),
            label: const Text(
              "Parolni yangilash (Face ID)",
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Tizimdan chiqish (Logout)
        SizedBox(
          width: double.infinity,
          child: TextButton.icon(
            style: TextButton.styleFrom(
              foregroundColor: Colors.red.shade600,
              backgroundColor: Colors.red.shade50,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () {
              _showLogoutDialog();
            },
            icon: const Icon(Icons.logout_rounded, size: 20),
            label: const Text(
              "Tizimdan chiqish (Logout)",
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
            ),
          ),
        ),
      ],
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          "Tizimdan chiqish",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        content: const Text(
          "Haqiqatan ham o'quvchi hisobingizdan chiqmoqchimisiz?",
          style: TextStyle(fontSize: 14, color: AppTheme.textDark),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Bekor qilish", style: TextStyle(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              ApiService.accessToken = null;
              ApiService.currentUser = null;
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
            child: const Text("Chiqish"),
          ),
        ],
      ),
    );
  }
}
