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

          // ⭐ Yulduzlar Balansi & Pulli Yutuqlar (Stars & Rewards Shop)
          if (role == 'STUDENT') ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFB300), Color(0xFFFF8F00)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(color: const Color(0xFFFF8F00).withOpacity(0.3), blurRadius: 14, offset: const Offset(0, 6)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.white.withOpacity(0.25), shape: BoxShape.circle),
                            child: const Icon(Icons.star_rounded, color: Colors.white, size: 26),
                          ),
                          const SizedBox(width: 10),
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("Jamg'arilgan Yulduzlar", style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                              Text("A'lo baho mukofotlari", style: TextStyle(color: Colors.white70, fontSize: 11)),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                        child: Row(
                          children: [
                            const Icon(Icons.star_rounded, color: Color(0xFFFF8F00), size: 18),
                            const SizedBox(width: 4),
                            Text(
                              "${user['stars_count'] ?? 15} ⭐",
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFFE65100)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.18),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.monetization_on_rounded, color: Colors.white, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            "Qiymati: ~${((user['stars_count'] ?? 15) * 10000).toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]} ')} so'm",
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFFE65100),
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
                              builder: (ctx) => _buildRewardsModal(ctx, user['stars_count'] ?? 15),
                            );
                          },
                          child: const Text("Yutuqlarni olish 🎁", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Shaxsiy ma'lumotlar bloki (Faqat ko'rish rejimida)
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
            ),
            child: Column(
              children: [
                _buildInfoTile(Icons.badge_outlined, "Hujjat seriya", passport),
                const Divider(height: 20),
                _buildInfoTile(Icons.lock_clock_outlined, "Biometrik sessiya", "10 kunlik xavfsiz token"),
                const Divider(height: 20),
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
        Text(title, style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
        const Spacer(),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
      ],
    );
  }

  Widget _buildRewardsModal(BuildContext context, int stars) {
    final rewards = [
      {"name": "50 000 so'm Payme / Click hisobga", "stars": 5, "icon": Icons.account_balance_wallet_rounded, "color": Colors.green},
      {"name": "100 000 so'm Naqd Pul / Sovg'a vaucheri", "stars": 10, "icon": Icons.payments_rounded, "color": Colors.teal},
      {"name": "Maktab kutubxonasidan kitoblar to'plami", "stars": 15, "icon": Icons.auto_stories_rounded, "color": Colors.blue},
      {"name": "Smart Watch yoki Ilmiy kurs vaucheri", "stars": 25, "icon": Icons.watch_rounded, "color": Colors.deepPurple},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Pulli Yutuqlar & Sovg'alar Do'koni", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.amber.shade100, borderRadius: BorderRadius.circular(12)),
                child: Text("$stars ⭐ bor", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.amber.shade900, fontSize: 13)),
              )
            ],
          ),
          const SizedBox(height: 6),
          const Text("Darslardagi a'lo baholar va faollik uchun ustozlar bergan yulduzlarni almashtiring.", style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          const SizedBox(height: 20),

          ...rewards.map((r) {
            final cost = r['stars'] as int;
            final canAfford = stars >= cost;
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: canAfford ? Colors.amber.shade300 : Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: (r['color'] as Color).withOpacity(0.12),
                    child: Icon(r['icon'] as IconData, color: r['color'] as Color, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Text("Talab etiladi: $cost ta yulduz ⭐", style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: canAfford ? AppTheme.primary : Colors.grey.shade300,
                      foregroundColor: canAfford ? Colors.white : Colors.grey.shade600,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: canAfford
                        ? () {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text("Tabriklaymiz! '${r['name']}' yutug'ini olish uchun so'rovingiz qabul qilindi. Maktab ma'muriyati tez orada bog'lanadi! 🎉"),
                                backgroundColor: AppTheme.success,
                                duration: const Duration(seconds: 4),
                              ),
                            );
                          }
                        : null,
                    child: Text(canAfford ? "Yutib olish" : "Yetarli emas", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
