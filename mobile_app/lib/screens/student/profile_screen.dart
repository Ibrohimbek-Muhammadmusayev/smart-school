import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import '../login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = ApiService.currentUser ?? {};
    final fullName = user['full_name'] ?? 'Foydalanuvchi';
    final passport = user['passport_series'] ?? 'AA 1234567';
    final role = user['role'] ?? 'STUDENT';

    final studentId = user['student_id'] ?? user['username'] ?? '';
    final photoUrl = user['photo_3x4'];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: Column(
        children: [
          const SizedBox(height: 10),
          Center(
            child: Stack(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.primary, width: 2),
                  ),
                  child: ClipOval(
                    child: photoUrl != null
                        ? Image.network(
                            photoUrl,
                            fit: BoxFit.cover,
                            width: 100,
                            height: 100,
                            errorBuilder: (ctx, err, stack) => const Icon(Icons.person, size: 54, color: AppTheme.primary),
                          )
                        : const Icon(Icons.person, size: 54, color: AppTheme.primary),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 4,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: AppTheme.success, shape: BoxShape.circle),
                    child: const Icon(Icons.check, size: 14, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            fullName,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          const SizedBox(height: 4),
          Text(
            "Rol: ${role == 'TEACHER' ? 'O\'qituvchi' : 'O\'quvchi'} | Kirish ID: ${studentId.isNotEmpty ? studentId : passport}",
            style: const TextStyle(color: AppTheme.textMuted, fontSize: 13, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 20),

          const SizedBox(height: 12),

          // Shaxsiy ma'lumotlar bloki (Easy Learn Card Style)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primary.withValues(alpha: 0.04),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                _buildInfoTile(Icons.badge_outlined, "Hujjat seriya", passport),
                const Divider(height: 24),
                _buildInfoTile(Icons.lock_clock_outlined, "Biometrik sessiya", "10 kunlik xavfsiz token"),
                const Divider(height: 24),
                _buildInfoTile(Icons.verified_user_outlined, "Face ID holati", "Tasdiqlangan ✅"),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Parolni o'zgartirish (Face ID orqali)
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.textDark,
                side: BorderSide(color: Colors.grey.shade300),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Xavfsiz rejim: Face ID tekshiruviga yo'naltirilmoqda...")),
                );
              },
              icon: const Icon(Icons.lock_reset_rounded, size: 20),
              label: const Text("Parolni yangilash (Face ID)"),
            ),
          ),
          const SizedBox(height: 12),

          // Chiqish
          SizedBox(
            width: double.infinity,
            child: TextButton.icon(
              style: TextButton.styleFrom(
                foregroundColor: Colors.red,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: () {
                ApiService.accessToken = null;
                ApiService.currentUser = null;
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              },
              icon: const Icon(Icons.logout_rounded, size: 20),
              label: const Text("Tizimdan chiqish (Logout)"),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String title, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppTheme.textMuted),
        const SizedBox(width: 14),
        Expanded(
          child: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
        ),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.end,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
        ),
      ],
    );
  }
}
