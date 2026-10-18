import 'dart:convert';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme.dart';
import 'board_ai_write_screen.dart';

class BoardControlScreen extends StatefulWidget {
  final int sessionId;
  final String deviceToken;
  final String teacherName;
  final String deviceName;
  final String geminiApiKey;
  final List<dynamic> initialCanvases;

  const BoardControlScreen({
    super.key,
    required this.sessionId,
    required this.deviceToken,
    required this.teacherName,
    this.deviceName = 'Smart Board',
    this.geminiApiKey = '',
    this.initialCanvases = const [],
  });

  @override
  State<BoardControlScreen> createState() => _BoardControlScreenState();
}

class _BoardControlScreenState extends State<BoardControlScreen> {
  bool _saving = false;
  bool _disconnecting = false;
  bool _loadingCanvases = false;
  List<dynamic> _canvases = [];
  String _geminiKey = '';

  @override
  void initState() {
    super.initState();
    _canvases = List<dynamic>.from(widget.initialCanvases);
    _geminiKey = widget.geminiApiKey;
    _refreshSessionAndLists();
  }

  Future<void> _refreshSessionAndLists() async {
    setState(() => _loadingCanvases = true);
    try {
      final sessionRes = await ApiService.getMyBoardSession();
      if (sessionRes['status'] == 'ACTIVE') {
        if (sessionRes['saved_canvases'] is List) {
          _canvases = List<dynamic>.from(sessionRes['saved_canvases']);
        }
        if ((sessionRes['gemini_api_key'] ?? '').toString().isNotEmpty) {
          _geminiKey = sessionRes['gemini_api_key'].toString();
        }
      } else {
        final userId = ApiService.currentUser?['id'];
        if (userId != null) {
          final loaded = await ApiService.loadBoardCanvases(userId);
          _canvases = loaded;
        }
      }
    } catch (_) {}
    if (mounted) {
      setState(() => _loadingCanvases = false);
    }
  }

  Future<void> _onSave() async {
    setState(() => _saving = true);
    try {
      final res = await ApiService.requestBoardSave(widget.sessionId);
      if (!mounted) return;
      setState(() => _saving = false);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_rounded, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(
                child: Text(res['message'] ?? "Saqlash buyrug'i yuborildi ✅"),
              ),
            ],
          ),
          backgroundColor: AppTheme.success,
        ),
      );
      await Future.delayed(const Duration(seconds: 1));
      _refreshSessionAndLists();
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Xatolik: $e"), backgroundColor: Colors.redAccent),
      );
    }
  }

  Future<void> _onDisconnect() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.power_settings_new_rounded, color: Colors.redAccent),
            SizedBox(width: 8),
            Text("Doskani uzish", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        content: const Text(
          "Haqiqatan ham elektron doska bilan aloqani uzmoqchimisiz? Doska QR kod kutish holatiga qaytadi.",
          style: TextStyle(fontSize: 13.5, color: AppTheme.textDark),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text("Bekor qilish", style: TextStyle(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Ha, uzish", style: TextStyle(fontSize: 13.5)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _disconnecting = true);
    try {
      final res = await ApiService.disconnectBoard(widget.sessionId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? "Sessiya uzildi. Doska QR kod holatiga qaytdi."),
          backgroundColor: AppTheme.primary,
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() => _disconnecting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Xatolik: $e"), backgroundColor: Colors.redAccent),
      );
    }
  }

  void _openListsModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.72,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
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
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "📋 Saqlangan Doska Listlari",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    "${_canvases.length} ta list",
                    style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              "Doskada saqlangan sahifalar va AI tomonidan yozilgan ma'lumotlar",
              style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 16),
            if (_canvases.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 28),
                child: Center(
                  child: Column(
                    children: [
                      Icon(Icons.layers_clear_rounded, size: 44, color: Colors.grey.shade400),
                      const SizedBox(height: 10),
                      const Text(
                        "Hozircha saqlangan listlar yo'q",
                        style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textDark),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        "\"Saqlash\" yoki \"AI yozish\" tugmasidan foydalaning",
                        style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
              )
            else
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: _canvases.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    final item = _canvases[i];
                    final listIndex = item['list_index'] ?? i;
                    final listName = item['list_name'] ?? 'List ${listIndex + 1}';
                    final rawData = (item['canvas_data'] ?? '').toString();
                    String previewText = "Chizma / Grafik ma'lumotlar";
                    try {
                      if (rawData.startsWith('{')) {
                        final parsed = jsonDecode(rawData);
                        if (parsed is Map && parsed['content'] != null) {
                          previewText = parsed['content'].toString();
                        }
                      } else if (rawData.isNotEmpty) {
                        previewText = rawData;
                      }
                    } catch (_) {}

                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.background,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryLight,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              "#${listIndex + 1}",
                              style: const TextStyle(
                                color: AppTheme.primary,
                                fontWeight: FontWeight.w900,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  listName.toString(),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: AppTheme.textDark,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  previewText,
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 12, color: AppTheme.textMuted, height: 1.3),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            tooltip: "Shu listga AI bilan yozish",
                            onPressed: () {
                              Navigator.pop(ctx);
                              _openAIWrite(initialListIndex: listIndex is int ? listIndex : 0);
                            },
                            icon: const Icon(Icons.auto_awesome_rounded, color: AppTheme.primary, size: 20),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            const SizedBox(height: 14),
          ],
        ),
      ),
    );
  }

  Future<void> _openAIWrite({int initialListIndex = 0}) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => BoardAIWriteScreen(
          sessionId: widget.sessionId,
          deviceToken: widget.deviceToken,
          geminiApiKey: _geminiKey,
          initialListIndex: initialListIndex,
        ),
      ),
    );
    _refreshSessionAndLists();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Aqlli Doska Boshqaruvi"),
        actions: [
          IconButton(
            onPressed: _refreshSessionAndLists,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshSessionAndLists,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Ulangan Doska Hero Card (StudentDashboard stili)
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary.withValues(alpha: 0.35),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.22),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF2ECC71),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Text(
                                "Doska ulangan (Faol)",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            "Sessiya #${widget.sessionId}",
                            style: const TextStyle(
                              color: AppTheme.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 11.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.18),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(Icons.tv_rounded, color: Colors.white, size: 30),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.deviceName,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                "Ustoz: ${widget.teacherName}",
                                style: const TextStyle(color: Colors.white70, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.qr_code_rounded, color: Colors.white70, size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              "Token: ${widget.deviceToken}",
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white70, fontSize: 11.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // 2. Boshqaruv Tugmalari Bloki (💾 Saqlash, 🤖 AI yozish, 📋 Listlar, 🔌 Uzish)
              const Text(
                "Tezkor Doska Amallari",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildActionCard(
                      icon: Icons.save_rounded,
                      title: "💾 Saqlash",
                      subtitle: _saving ? "Yuborilmoqda..." : "Doskani serverga saqlash",
                      color: AppTheme.success,
                      onTap: _saving ? () {} : _onSave,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionCard(
                      icon: Icons.auto_awesome_rounded,
                      title: "🤖 AI yozish",
                      subtitle: "Gemini orqali doskaga yozish",
                      color: AppTheme.primary,
                      onTap: () => _openAIWrite(),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildActionCard(
                      icon: Icons.view_list_rounded,
                      title: "📋 Listlar (${_canvases.length})",
                      subtitle: "Saqlangan sahifalarni ko'rish",
                      color: AppTheme.secondaryOrange,
                      onTap: _openListsModal,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionCard(
                      icon: Icons.link_off_rounded,
                      title: "🔌 Uzish",
                      subtitle: _disconnecting ? "Uzilmoqda..." : "Sessiyani yakunlash",
                      color: AppTheme.secondaryPink,
                      onTap: _disconnecting ? () {} : _onDisconnect,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // 3. Saqlangan Listlar Ro'yxati (Jonli Ko'rinish)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Doskadagi Saqlangan Listlar",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                  ),
                  TextButton.icon(
                    onPressed: () => _openAIWrite(initialListIndex: _canvases.length),
                    icon: const Icon(Icons.add_circle_outline_rounded, size: 16),
                    label: const Text("Yangi AI List", style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (_loadingCanvases)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (_canvases.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryLight,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.layers_outlined, color: AppTheme.primary, size: 28),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        "Saqlangan doska listlari topilmadi",
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5, color: AppTheme.textDark),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        "Doskadagi yozuvlarni saqlash uchun \"💾 Saqlash\" tugmasini bosing yoki \"🤖 AI yozish\" orqali yangi mavzu chiqaring.",
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: AppTheme.textMuted, height: 1.35),
                      ),
                    ],
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _canvases.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final c = _canvases[index];
                    final listIndex = c['list_index'] ?? index;
                    final listName = c['list_name'] ?? 'List ${listIndex + 1}';
                    final rawData = (c['canvas_data'] ?? '').toString();
                    String summary = "Doska chizmasi saqlangan";
                    try {
                      if (rawData.startsWith('{')) {
                        final parsed = jsonDecode(rawData);
                        if (parsed is Map && parsed['content'] != null) {
                          summary = parsed['content'].toString();
                        }
                      } else if (rawData.isNotEmpty) {
                        summary = rawData;
                      }
                    } catch (_) {}

                    return InkWell(
                      borderRadius: BorderRadius.circular(20),
                      onTap: () => _openAIWrite(initialListIndex: listIndex is int ? listIndex : index),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryLight,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Icon(Icons.sticky_note_2_rounded, color: AppTheme.primary, size: 22),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    listName.toString(),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14.5,
                                      color: AppTheme.textDark,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    summary,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.edit_rounded, size: 18, color: AppTheme.primary),
                          ],
                        ),
                      ),
                    );
                  },
                ),

              const SizedBox(height: 24),
              // Pastda katta Uzish tugmasi
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.redAccent,
                    side: BorderSide(color: Colors.redAccent.withValues(alpha: 0.4), width: 1.5),
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  onPressed: _disconnecting ? null : _onDisconnect,
                  icon: const Icon(Icons.power_settings_new_rounded, size: 20),
                  label: const Text(
                    "🔌 Elektron Doskadan Uzish",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14.5,
                  color: AppTheme.textDark,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
