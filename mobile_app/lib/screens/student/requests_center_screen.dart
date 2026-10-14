import 'package:flutter/material.dart';
import '../../theme.dart';

class RequestItem {
  final String id;
  final String reasonType;
  final String dateRange;
  final String pairs;
  final String description;
  final String status; // 'PENDING', 'APPROVED', 'REJECTED'
  final String? rejectReason;
  final String submittedDate;
  final String? documentName;

  RequestItem({
    required this.id,
    required this.reasonType,
    required this.dateRange,
    required this.pairs,
    required this.description,
    required this.status,
    this.rejectReason,
    required this.submittedDate,
    this.documentName,
  });
}

class RequestsCenterScreen extends StatefulWidget {
  const RequestsCenterScreen({super.key});

  @override
  State<RequestsCenterScreen> createState() => _RequestsCenterScreenState();
}

class _RequestsCenterScreenState extends State<RequestsCenterScreen> {
  final List<RequestItem> _requests = [
    RequestItem(
      id: 'ARZ-104',
      reasonType: 'Salomatlik (Tibbiy)',
      dateRange: '14-oktyabr 2026',
      pairs: '2 va 3-paralar',
      description: 'Shifokor ko\'rigiga borish va 095-forma bo\'yicha davolanish zaruriyati tufayli.',
      status: 'PENDING',
      submittedDate: 'Bugun, 08:30',
      documentName: 'spravka_095_forma.jpg',
    ),
    RequestItem(
      id: 'ARZ-098',
      reasonType: 'Musobaqa / Tanlov',
      dateRange: '10-oktyabr 2026',
      pairs: 'To\'liq kun (1, 2, 3-paralar)',
      description: 'Universitetlararo Dasturlash Olimpiadasi Respublika bosqichi ishtirokchisi sifatida.',
      status: 'APPROVED',
      submittedDate: '09-oktyabr, 14:10',
      documentName: 'chaqiruv_xati_vazirlik.pdf',
    ),
    RequestItem(
      id: 'ARZ-085',
      reasonType: 'Oilaviy sharoit',
      dateRange: '03-oktyabr 2026',
      pairs: '1-para',
      description: 'Oilaviy zaruriy tadbir sababli.',
      status: 'REJECTED',
      rejectReason: 'Tasdiqlovchi rasmiy hujjat ilova qilinmagan. Dekanat tomonidan rad etildi.',
      submittedDate: '03-oktyabr, 07:50',
    ),
  ];

  void _showNewRequestModal() {
    String selectedReason = 'Salomatlik (Tibbiy)';
    final descController = TextEditingController();
    String dateText = "15-oktyabr 2026";
    String selectedPairs = "2 va 3-paralar";
    String? attachedFile;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            left: 24,
            right: 24,
            top: 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 5,
                    decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "Sababli Qoldirish Arizasi",
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                    ),
                    IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close_rounded)),
                  ],
                ),
                const SizedBox(height: 16),

                // Sabab turi
                const Text("Qoldirish sababi turi", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textDark)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: selectedReason,
                      isExpanded: true,
                      items: [
                        'Salomatlik (Tibbiy)',
                        'Oilaviy sharoit',
                        'Musobaqa / Tanlov',
                        'Boshqa uzrli sabab'
                      ].map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontSize: 13)))).toList(),
                      onChanged: (v) => setModalState(() => selectedReason = v!),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Sana va paralar
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text("Sana", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.calendar_today_rounded, size: 16, color: AppTheme.primary),
                                const SizedBox(width: 8),
                                Text(dateText, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text("Paralar", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                            child: Text(selectedPairs, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Izoh
                const Text("Tushuntirish / Izoh matni", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 8),
                TextField(
                  controller: descController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: "Darsni qoldirish sababini batafsil yozing...",
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
                const SizedBox(height: 16),

                // Tasdiqlovchi hujjat ilova qilish
                const Text("Tasdiqlovchi hujjat (095-forma / Chaqiruv xati)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 8),
                InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () {
                    setModalState(() {
                      attachedFile = "med_spravka_095_${DateTime.now().millisecondsSinceEpoch}.jpg";
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.attach_file_rounded, color: AppTheme.primary),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            attachedFile ?? "Rasm yoki PDF yuklash (kamera / fayl)",
                            style: TextStyle(
                              color: attachedFile != null ? AppTheme.primary : AppTheme.textMuted,
                              fontWeight: attachedFile != null ? FontWeight.bold : FontWeight.normal,
                              fontSize: 12.5,
                            ),
                          ),
                        ),
                        if (attachedFile != null)
                          const Icon(Icons.check_circle_rounded, color: AppTheme.success, size: 20),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Yuborish tugmasi
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      if (descController.text.trim().isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Iltimos, tushuntirish matnini yozing!")),
                        );
                        return;
                      }
                      setState(() {
                        _requests.insert(
                          0,
                          RequestItem(
                            id: 'ARZ-${DateTime.now().millisecondsSinceEpoch % 1000}',
                            reasonType: selectedReason,
                            dateRange: dateText,
                            pairs: selectedPairs,
                            description: descController.text.trim(),
                            status: 'PENDING',
                            submittedDate: 'Hozirgina',
                            documentName: attachedFile,
                          ),
                        );
                      });
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Arizangiz guruh rahbari va dekanatga yuborildi! ✅")),
                      );
                    },
                    child: const Text("Arizani Yuborish  ➔"),
                  ),
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text("Arizalar & Spravkalar", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.textDark)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 3.1. Katta Amallar Bloki: Yangi Ariza Qoldirish Karta
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(26),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primary.withValues(alpha: 0.35),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Dars qoldirish kerakmi?",
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          "Spravka yoki rasmiy hujjat yuklab, NB soatlarini sababliga aylantiring.",
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppTheme.primary,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          onPressed: _showNewRequestModal,
                          icon: const Icon(Icons.add_rounded, size: 20),
                          label: const Text("Yangi Ariza Qoldirish", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), shape: BoxShape.circle),
                    child: const Icon(Icons.description_rounded, color: Colors.white, size: 32),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 3.2. Yuborilgan Arizalar Oqimi
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Yuborilgan Arizalar Oqimi", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
                Text("${_requests.length} ta ariza", style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              ],
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _requests.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (ctx, i) {
                final req = _requests[i];
                Color statusColor;
                String statusLabel;
                IconData statusIcon;

                if (req.status == 'APPROVED') {
                  statusColor = AppTheme.success;
                  statusLabel = "Tasdiqlandi (Sababli NB)";
                  statusIcon = Icons.check_circle_rounded;
                } else if (req.status == 'REJECTED') {
                  statusColor = Colors.red.shade700;
                  statusLabel = "Rad etildi";
                  statusIcon = Icons.cancel_rounded;
                } else {
                  statusColor = AppTheme.secondaryOrange;
                  statusLabel = "Ko'rib chiqilmoqda";
                  statusIcon = Icons.hourglass_top_rounded;
                }

                return Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 3)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(req.id, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textMuted)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(statusIcon, size: 13, color: statusColor),
                                const SizedBox(width: 4),
                                Text(statusLabel, style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(req.reasonType, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textDark)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.date_range_rounded, size: 14, color: AppTheme.textMuted),
                          const SizedBox(width: 4),
                          Text("${req.dateRange} (${req.pairs})", style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(req.description, style: const TextStyle(fontSize: 13, height: 1.35, color: Color(0xFF4A4E69))),

                      if (req.documentName != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.attach_file_rounded, size: 16, color: AppTheme.primary),
                              const SizedBox(width: 6),
                              Text(req.documentName!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                            ],
                          ),
                        ),
                      ],

                      if (req.rejectReason != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.red.shade200),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.info_outline_rounded, size: 18, color: Colors.red.shade700),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  "Dekanat izohi: ${req.rejectReason}",
                                  style: TextStyle(color: Colors.red.shade800, fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("Yuborildi: ${req.submittedDate}", style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                          const Text("Guruh rahbari ko'rigida", style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppTheme.textMuted)),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
