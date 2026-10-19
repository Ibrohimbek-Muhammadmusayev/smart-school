import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import '../theme.dart';

class NotificationModel {
  final String id;
  final String title;
  final String description;
  final String time;
  final String category; // 'davomat', 'baho', 'dars', 'tizim'
  final IconData icon;
  final Color iconColor;
  final Color iconBg;
  bool isRead;

  NotificationModel({
    required this.id,
    required this.title,
    required this.description,
    required this.time,
    required this.category,
    required this.icon,
    required this.iconColor,
    required this.iconBg,
    this.isRead = false,
  });
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _selectedFilter = 'Barchasi';

  final List<NotificationModel> _notifications = [
    NotificationModel(
      id: '1',
      title: "Davomat tasdiqlandi ✅",
      description: "Informatika & Python darsida dinamik QR-kod orqali qatnashuvingiz muvaffaqiyatli belgilandi.",
      time: "10 daqiqa oldin",
      category: 'davomat',
      icon: Icons.qr_code_scanner_rounded,
      iconColor: AppTheme.primary,
      iconBg: AppTheme.primaryLight,
      isRead: false,
    ),
    NotificationModel(
      id: '2',
      title: "Yangi a'lo baho qo'yildi! 📝",
      description: "Matematika fanidan o'tilgan dars uchun 5 baho qayd etildi.",
      time: "1 soat oldin",
      category: 'baho',
      icon: Icons.assignment_turned_in_rounded,
      iconColor: AppTheme.success,
      iconBg: const Color(0xFFE8F5E9),
      isRead: false,
    ),
    NotificationModel(
      id: '3',
      title: "Keyingi dars xonasi eslatmasi 🔔",
      description: "Fizika darsi 204-laboratoriya xonasida soat 10:20 da boshlanadi. O'z vaqtida kelishingiz so'raladi.",
      time: "Bugun, 09:45",
      category: 'dars',
      icon: Icons.access_time_filled_rounded,
      iconColor: AppTheme.secondaryPink,
      iconBg: const Color(0xFFFFECEF),
      isRead: true,
    ),
    NotificationModel(
      id: '4',
      title: "Face ID xavfsiz sessiyasi faol 🛡️",
      description: "10 kunlik xavfsiz biometrik kirish sessiyasi muvaffaqiyatli ishga tushirilgan.",
      time: "Kecha, 18:30",
      category: 'tizim',
      icon: Icons.security_rounded,
      iconColor: AppTheme.success,
      iconBg: const Color(0xFFE8F8F5),
      isRead: true,
    ),
    NotificationModel(
      id: '5',
      title: "Uyga vazifa topshirildi 📝",
      description: "Geometriya fanidan topshirilgan topshirig'ingiz o'qituvchi tomonidan ko'rib chiqilmoqda.",
      time: "2 kun oldin",
      category: 'dars',
      icon: Icons.assignment_turned_in_rounded,
      iconColor: AppTheme.secondaryBlue,
      iconBg: const Color(0xFFE5F9FD),
      isRead: true,
    ),
  ];

  void _markAllAsRead() {
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Barcha bildirishnomalar o'qilgan deb belgilandi!"),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _clearNotification(String id) {
    setState(() {
      _notifications.removeWhere((item) => item.id == id);
    });
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    final filteredList = _notifications.where((n) {
      if (_selectedFilter == 'O\'qilmagan') return !n.isRead;
      if (_selectedFilter == 'Davomat') return n.category == 'davomat';
      if (_selectedFilter == 'Baholar') return n.category == 'baho';
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: Padding(
          padding: const EdgeInsets.only(left: 14),
          child: Center(
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => Navigator.pop(context),
              child: Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppTheme.textDark),
              ),
            ),
          ),
        ),
        title: const Text(
          "Bildirishnomalar",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textDark,
          ),
        ),
        centerTitle: true,
        actions: [
          if (unreadCount > 0)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: TextButton.icon(
                onPressed: _markAllAsRead,
                icon: const Icon(Icons.done_all_rounded, size: 16, color: AppTheme.primary),
                label: const Text(
                  "O'qilgan",
                  style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 12),

            // Kategoriya filtrlari (Easy Learn Pill Style)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  _buildFilterChip("Barchasi", _notifications.length),
                  _buildFilterChip("O'qilmagan", unreadCount),
                  _buildFilterChip("Davomat", _notifications.where((n) => n.category == 'davomat').length),
                  _buildFilterChip("Baholar", _notifications.where((n) => n.category == 'baho').length),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Bildirishnomalar ro'yxati
            Expanded(
              child: RefreshIndicator(
                color: AppTheme.primary,
                backgroundColor: Colors.white,
                displacement: 32,
                onRefresh: () async {
                  await Future.delayed(const Duration(milliseconds: 500));
                  HapticFeedback.lightImpact();
                  if (!context.mounted) return;
                  setState(() {});
                  ScaffoldMessenger.of(context).hideCurrentSnackBar();
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Row(
                          children: const [
                            Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                            SizedBox(width: 10),
                            Text("Bildirishnomalar yangilandi ✅", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
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
                },
                child: filteredList.isEmpty
                    ? SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        child: Container(
                          height: 350,
                          alignment: Alignment.center,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 80,
                                height: 80,
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryLight,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.notifications_off_rounded, size: 40, color: AppTheme.primary),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                "Bildirishnomalar mavjud emas",
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                "Barcha yangiliklar va eslatmalar shu yerda ko'rinadi",
                                style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      )
                    : ListView.separated(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        itemCount: filteredList.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final item = filteredList[index];
                        return Dismissible(
                          key: Key(item.id),
                          direction: DismissDirection.endToStart,
                          onDismissed: (_) => _clearNotification(item.id),
                          background: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 20),
                            decoration: BoxDecoration(
                              color: Colors.red.shade400,
                              borderRadius: BorderRadius.circular(22),
                            ),
                            child: const Icon(Icons.delete_outline_rounded, color: Colors.white, size: 26),
                          ),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(22),
                            onTap: () {
                              setState(() => item.isRead = true);
                            },
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(22),
                                border: Border.all(
                                  color: item.isRead
                                      ? Colors.black.withValues(alpha: 0.04)
                                      : AppTheme.primary.withValues(alpha: 0.25),
                                  width: item.isRead ? 1 : 1.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: item.isRead
                                        ? Colors.black.withValues(alpha: 0.02)
                                        : AppTheme.primary.withValues(alpha: 0.07),
                                    blurRadius: 14,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Icon Badge
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: item.iconBg,
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Icon(item.icon, color: item.iconColor, size: 26),
                                  ),
                                  const SizedBox(width: 14),

                                  // Content
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                item.title,
                                                style: TextStyle(
                                                  fontSize: 15,
                                                  fontWeight: item.isRead ? FontWeight.w600 : FontWeight.bold,
                                                  color: AppTheme.textDark,
                                                ),
                                              ),
                                            ),
                                            if (!item.isRead) ...[
                                              const SizedBox(width: 6),
                                              Container(
                                                width: 8,
                                                height: 8,
                                                decoration: const BoxDecoration(
                                                  color: AppTheme.primary,
                                                  shape: BoxShape.circle,
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          item.description,
                                          style: TextStyle(
                                            fontSize: 12.5,
                                            height: 1.35,
                                            color: item.isRead ? AppTheme.textMuted : const Color(0xFF4A4E69),
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            const Icon(Icons.access_time_rounded, size: 12, color: AppTheme.textMuted),
                                            const SizedBox(width: 4),
                                            Text(
                                              item.time,
                                              style: const TextStyle(fontSize: 11, color: AppTheme.textMuted, fontWeight: FontWeight.w500),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, int count) {
    final isSelected = _selectedFilter == label;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => setState(() => _selectedFilter = label),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primary : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? AppTheme.primary : Colors.black.withValues(alpha: 0.05),
            ),
            boxShadow: [
              if (isSelected)
                BoxShadow(
                  color: AppTheme.primary.withValues(alpha: 0.25),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : AppTheme.textDark,
                ),
              ),
              if (count > 0) ...[
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.white.withValues(alpha: 0.25) : AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    "$count",
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : AppTheme.primary,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
